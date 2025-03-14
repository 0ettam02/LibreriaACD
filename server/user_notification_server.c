#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8088
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

void handle_send_notification(int client_socket, char* buffer) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Content-Type: application/json\r\n"
        "\r\n";

    if (buffer == NULL) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Dati non validi\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        return;
    }

    struct json_object *parsed_json;
    parsed_json = json_tokener_parse(buffer);
    struct json_object *userId, *message;
    json_object_object_get_ex(parsed_json, "userId", &userId);
    json_object_object_get_ex(parsed_json, "message", &message);

    const char *user_id_str = json_object_get_string(userId);
    const char *message_str = json_object_get_string(message);

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

    char query[512];
    snprintf(query, sizeof(query),
        "UPDATE utenti SET notifiche = array_append(notifiche, '%s') WHERE id_utente = %s",
        message_str, user_id_str);

    PGresult *res = PQexec(conn, query);

    send(client_socket, response_headers, strlen(response_headers), 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        const char* error_msg = PQresultErrorMessage(res);
        char error_response[512];
        snprintf(error_response, sizeof(error_response), 
                "{\"status\": \"error\", \"message\": \"%s\"}", 
                error_msg);
        send(client_socket, error_response, strlen(error_response), 0);
    } else {
        const char* success_response = "{\"status\": \"success\", \"message\": \"Messaggio inviato con successo\"}";
        send(client_socket, success_response, strlen(success_response), 0);
    }

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
}

void* handle_client(void* arg) {
    int client_socket = *(int*)arg;
    char buffer[BUFFER_SIZE] = {0};
    free(arg);

    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';
        handle_send_notification(client_socket, buffer);
    }

    close(client_socket);
    return NULL;
}

int main() {
    int server_fd;
    struct sockaddr_in address;
    int opt = 1;
    socklen_t addrlen = sizeof(address);

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
        int client_socket;
        if ((client_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen)) < 0) {
            perror("accept fallita");
            continue;
        }

        int* arg = malloc(sizeof(int));
        *arg = client_socket;

        pthread_t thread;
        if (pthread_create(&thread, NULL, handle_client, arg) != 0) {
            perror("Creazione thread fallita");
            free(arg);
            close(client_socket);
            continue;
        }
        pthread_detach(thread);
    }

    close(server_fd);
    return 0;
} 