#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8082
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int socket;
} ThreadArgs;

void handle_inserimento_libro(int client_socket, char* buffer) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Access-Control-Allow-Credentials: true\r\n"
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
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
    struct json_object *titolo, *autore, *genere, *numLibri, *prenotati;
    json_object_object_get_ex(parsed_json, "titolo", &titolo);
    json_object_object_get_ex(parsed_json, "autore", &autore);
    json_object_object_get_ex(parsed_json, "genere", &genere);
    json_object_object_get_ex(parsed_json, "numLibri", &numLibri);
    json_object_object_get_ex(parsed_json, "prenotati", &prenotati);

    if (!titolo || !autore || !genere || !numLibri || !prenotati) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Dati mancanti\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        json_object_put(parsed_json);
        return;
    }

    const char *titolo_str = json_object_get_string(titolo);
    const char *autore_str = json_object_get_string(autore);
    const char *genere_str = json_object_get_string(genere);
    int num_libri = json_object_get_int(numLibri);
    int prenotati_int = json_object_get_int(prenotati);

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

    send(client_socket, response_headers, strlen(response_headers), 0);

    PGresult *res;
    const char *paramValues[3] = {titolo_str, autore_str, genere_str};
    res = PQexecParams(conn,
        "INSERT INTO Libri (titolo, autore, genere) VALUES ($1, $2, $3) RETURNING id_libro",
        3, NULL, paramValues, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        const char* error_msg = PQresultErrorMessage(res);
        char error_response[512];
        snprintf(error_response, sizeof(error_response), 
                "{\"status\": \"error\", \"message\": \"%s\"}", 
                error_msg);
        send(client_socket, error_response, strlen(error_response), 0);
        PQclear(res);
        PQfinish(conn);
        pthread_mutex_unlock(&db_mutex);
        json_object_put(parsed_json);
        return;
    }

    int id_libro = atoi(PQgetvalue(res, 0, 0));
    PQclear(res);

    char id_libro_str[12];
    char num_libri_str[12];
    sprintf(id_libro_str, "%d", id_libro);
    sprintf(num_libri_str, "%d", num_libri);

    const char *paramValuesCopie[3] = {id_libro_str, num_libri_str, num_libri_str};
    res = PQexecParams(conn,
        "INSERT INTO Copie (id_libro, copie_totali, copie_disponibili) VALUES ($1, $2, $3)",
        3, NULL, paramValuesCopie, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        const char* error_msg = PQresultErrorMessage(res);
        char error_response[512];
        snprintf(error_response, sizeof(error_response), 
                "{\"status\": \"error\", \"message\": \"%s\"}", 
                error_msg);
        send(client_socket, error_response, strlen(error_response), 0);
    } else {
        const char* success_response = "{\"status\": \"success\", \"message\": \"Libro inserito con successo\"}";
        send(client_socket, success_response, strlen(success_response), 0);
    }

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
    json_object_put(parsed_json);
}

void handle_options(int client_socket) {
    const char* options_response = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Access-Control-Allow-Credentials: true\r\n"
        "Content-Length: 0\r\n"
        "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
        "\r\n";
    
    send(client_socket, options_response, strlen(options_response), 0);
}

void* handle_client(void* arg) {
    ThreadArgs* args = (ThreadArgs*)arg;
    int client_socket = args->socket;
    char buffer[BUFFER_SIZE] = {0};
    free(arg);

    ssize_t bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';

        if (strstr(buffer, "OPTIONS") != NULL) {
            handle_options(client_socket);
        } else if (strstr(buffer, "POST") != NULL) {
            handle_inserimento_libro(client_socket, buffer);
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