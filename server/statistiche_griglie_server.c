#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8086
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int socket;
} ThreadArgs;

void handle_statistiche(int client_socket) {
    const char* response_headers = 
    "HTTP/1.1 200 OK\r\n"
    "Access-Control-Allow-Origin: http://localhost:3000\r\n"
    "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
    "Access-Control-Allow-Headers: Content-Type\r\n"
    "Content-Type: application/json\r\n"
    "\r\n";

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

    // Estrai il metodo dalla richiesta
    char buffer[BUFFER_SIZE] = {0};
    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';
        char* method = strtok(buffer, " "); // Supponendo che il buffer contenga la richiesta
        if (strcmp(method, "OPTIONS") == 0) {
            send(client_socket, response_headers, strlen(response_headers), 0);
            pthread_mutex_unlock(&db_mutex);
            PQfinish(conn);
            return;
        }
    }

    // Recupera il titolo del libro dalla query string
    char* query_string = getenv("QUERY_STRING");
    char titolo[256];
    sscanf(query_string, "titolo=%s", titolo); // Assicurati di gestire correttamente la decodifica dell'URL

    // Query per ottenere le statistiche delle prenotazioni
    char query[512];
    snprintf(query, sizeof(query), 
        "SELECT P.id_utente, P.data_prestito, P.data_scadenza, P.id_libro "
        "FROM prestiti AS P "
        "INNER JOIN libri AS L ON P.id_libro = L.id_libro "
        "WHERE L.titolo = '%s'", titolo);
    
    PGresult *res = PQexec(conn, query);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        const char* error_msg = PQresultErrorMessage(res);
        char error_response[512];
        snprintf(error_response, sizeof(error_response), 
                "{\"status\": \"error\", \"message\": \"%s\"}", 
                error_msg);
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        PQclear(res);
        PQfinish(conn);
        pthread_mutex_unlock(&db_mutex);
        return;
    }

    int n_rows = PQntuples(res);
    struct json_object *json_array = json_object_new_array();

    for (int i = 0; i < n_rows; i++) {
        struct json_object *json_obj = json_object_new_object();
        json_object_object_add(json_obj, "id_utente", json_object_new_int(atoi(PQgetvalue(res, i, 0))));
        json_object_object_add(json_obj, "data_prestito", json_object_new_string(PQgetvalue(res, i, 1)));
        json_object_object_add(json_obj, "data_scadenza", json_object_new_string(PQgetvalue(res, i, 2)));
        json_object_object_add(json_obj, "id_libro", json_object_new_int(atoi(PQgetvalue(res, i, 3))));
        json_object_array_add(json_array, json_obj);
    }

    const char *json_str = json_object_to_json_string(json_array);
    send(client_socket, response_headers, strlen(response_headers), 0);
    send(client_socket, json_str, strlen(json_str), 0);

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
    json_object_put(json_array);
}

void* handle_client(void* arg) {
    ThreadArgs* args = (ThreadArgs*)arg;
    int client_socket = args->socket;
    char buffer[BUFFER_SIZE] = {0};
    free(arg);

    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';

        // Gestisci le richieste OPTIONS (preflight)
        if (strstr(buffer, "OPTIONS /") != NULL) {
            const char* options_response = 
                "HTTP/1.1 200 OK\r\n"
                "Access-Control-Allow-Origin: http://localhost:3000\r\n"
                "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type\r\n"
                "\r\n";
            send(client_socket, options_response, strlen(options_response), 0);
        }

        // Gestisci le richieste GET
        if (strstr(buffer, "GET /") != NULL) {
            handle_statistiche(client_socket);
        }
    }

    close(client_socket);
    return NULL;
}

int main() {
    int server_fd;
    struct sockaddr_in address;
    int opt = 1;

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("Creazione socket fallita");
        exit(EXIT_FAILURE);
    }

    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt fallita");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind fallita");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, MAX_CLIENTS) < 0) {
        perror("listen fallita");
        exit(EXIT_FAILURE);
    }

    printf("Server in ascolto sulla porta %d...\n", PORT);

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_socket = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        
        if (client_socket < 0) {
            perror("accept fallita");
            continue;
        }

        ThreadArgs* args = malloc(sizeof(ThreadArgs));
        args->socket = client_socket;

        pthread_t thread;
        if (pthread_create(&thread, NULL, handle_client, args) != 0) {
            perror("Creazione thread fallita");
            free(args);
            close(client_socket);
            continue;
        }
        pthread_detach(thread);
    }

    close(server_fd);
    return 0;
}