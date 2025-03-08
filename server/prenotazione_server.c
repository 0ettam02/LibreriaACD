#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8085
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int socket;
} ThreadArgs;

void handle_prenotazione(int client_socket, char* buffer) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: http://localhost:3000\r\n"
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

    char* json_start = strstr(buffer, "{");
    if (!json_start) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"JSON non valido\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        return;
    }

    struct json_object *parsed_json = json_tokener_parse(json_start);
    struct json_object *data_prestito, *data_scadenza, *id_utente, *titolo;
    json_object_object_get_ex(parsed_json, "data_prestito", &data_prestito);
    json_object_object_get_ex(parsed_json, "data_scadenza", &data_scadenza);
    json_object_object_get_ex(parsed_json, "id_utente", &id_utente);
    json_object_object_get_ex(parsed_json, "titolo", &titolo);

    const char *data_prestito_str = json_object_get_string(data_prestito);
    const char *data_scadenza_str = json_object_get_string(data_scadenza);
    int id_utente_int = json_object_get_int(id_utente);
    const char *titolo_str = json_object_get_string(titolo);

    pthread_mutex_lock(&db_mutex);

    PGconn *conn = PQconnectdb("host=localhost port=5432 dbname=libreriaACD user=postgres password=matteo");

    if (PQstatus(conn) != CONNECTION_OK) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Errore di connessione al database\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        pthread_mutex_unlock(&db_mutex);
        json_object_put(parsed_json);
        PQfinish(conn);
        return;
    }

    // Recupera l'id_libro dal titolo
    char query[256];
    snprintf(query, sizeof(query), "SELECT id_libro FROM Libri WHERE titolo = '%s'", titolo_str);
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
        json_object_put(parsed_json);
        return;
    }

    int id_libro = atoi(PQgetvalue(res, 0, 0));
    PQclear(res);

    // Converti id_utente e id_libro in stringhe
    char id_utente_str[12], id_libro_str[12];
    snprintf(id_utente_str, sizeof(id_utente_str), "%d", id_utente_int);
    snprintf(id_libro_str, sizeof(id_libro_str), "%d", id_libro);

    // Inserisci la prenotazione con l'id_libro
    const char *paramValues[4] = {id_utente_str, data_prestito_str, data_scadenza_str, id_libro_str};
    res = PQexecParams(conn,
        "INSERT INTO Prestiti (id_utente, data_prestito, data_scadenza, id_libro) VALUES ($1::integer, $2::date, $3::date, $4::integer)",
        4, NULL, paramValues, NULL, NULL, 0);

    send(client_socket, response_headers, strlen(response_headers), 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        const char* error_msg = PQresultErrorMessage(res);
        char error_response[512];
        snprintf(error_response, sizeof(error_response), 
                "{\"status\": \"error\", \"message\": \"%s\"}", 
                error_msg);
        send(client_socket, error_response, strlen(error_response), 0);
    } else {
        const char* success_response = "{\"status\": \"success\", \"message\": \"Prenotazione effettuata con successo\"}";
        send(client_socket, success_response, strlen(success_response), 0);
    }

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
    json_object_put(parsed_json);
}

void* handle_client(void* arg) {
    ThreadArgs* args = (ThreadArgs*)arg;
    int client_socket = args->socket;
    char buffer[BUFFER_SIZE] = {0};
    free(arg);

    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';

        if (strstr(buffer, "POST") != NULL) {
            handle_prenotazione(client_socket, buffer);
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
