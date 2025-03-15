#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8089
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int socket;
} ThreadArgs;

void handle_check_notifiche(int client_socket, char* query_string);

void* handle_client(void* arg) {
    ThreadArgs* args = (ThreadArgs*)arg;
    int client_socket = args->socket;
    char buffer[BUFFER_SIZE] = {0};
    free(arg);

    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';

        if (strstr(buffer, "OPTIONS") != NULL) {
            const char* options_response = 
                "HTTP/1.1 200 OK\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type\r\n"
                "Content-Length: 0\r\n"
                "\r\n";
            send(client_socket, options_response, strlen(options_response), 0);
        } else {
            char* query_start = strstr(buffer, "userId=");
            if (query_start) {
                handle_check_notifiche(client_socket, query_start);
            }
        }
    }

    close(client_socket);
    return NULL;
}

void handle_check_notifiche(int client_socket, char* query_string) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Content-Type: application/json\r\n"
        "\r\n";

    char userId[256];
    sscanf(query_string, "userId=%s", userId);

    pthread_mutex_lock(&db_mutex);
    
    PGconn *conn = PQconnectdb("host=localhost port=5432 dbname=libreriaACD user=postgres password=matteo");
    
    if (PQstatus(conn) != CONNECTION_OK) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Errore di connessione al database\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        pthread_mutex_unlock(&db_mutex);
        PQfinish(conn);
        return;
    }

    const char *paramValues[1] = {userId};
    PGresult *res = PQexecParams(conn,
        "SELECT id_notifica, messaggio FROM Notifiche WHERE id_utente = $1",
        1, NULL, paramValues, NULL, NULL, 0);

    send(client_socket, response_headers, strlen(response_headers), 0);

    if (PQresultStatus(res) == PGRES_TUPLES_OK) {
        int rows = PQntuples(res);
        char response[4096];
        char *current = response;
        current += sprintf(current, "{\"hasNotifications\": %s, \"notifiche\": [", rows > 0 ? "true" : "false");
        
        for (int i = 0; i < rows; i++) {
            current += sprintf(current, 
                "{\"id\": %s, \"messaggio\": \"%s\"}%s",
                PQgetvalue(res, i, 0),
                PQgetvalue(res, i, 1),
                i < rows - 1 ? "," : "");
        }
        
        strcat(current, "]}");
        send(client_socket, response, strlen(response), 0);
    } else {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Errore nella query\"}";
        send(client_socket, error_response, strlen(error_response), 0);
    }

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Uso: %s <porta>\n", argv[0]);
        return 1;
    }

    int server_port = atoi(argv[1]);
    int server_fd;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("Creazione socket fallita");
        exit(EXIT_FAILURE);
    }

    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(server_port);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind fallito");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    printf("Server in ascolto sulla porta %d...\n", server_port);

    while (1) {
        int new_socket;
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            perror("accept");
            continue;
        }

        ThreadArgs* args = malloc(sizeof(ThreadArgs));
        args->socket = new_socket;

        pthread_t thread_id;
        if (pthread_create(&thread_id, NULL, handle_client, (void*)args) < 0) {
            perror("pthread_create");
            free(args);
            close(new_socket);
            continue;
        }
        pthread_detach(thread_id);
    }

    return 0;
}

 