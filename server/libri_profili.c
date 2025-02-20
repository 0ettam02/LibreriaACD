#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <json-c/json.h>
#include <postgresql/libpq-fe.h>

#define PORT 8080
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

pthread_mutex_t db_mutex = PTHREAD_MUTEX_INITIALIZER;

typedef struct {
    int socket;
} ThreadArgs;

void handle_get_libri(int client_socket) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: http://localhost:3000\r\n"
        "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
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

    PGresult *res = PQexec(conn, 
        "SELECT l.titolo, l.autore, l.genere, c.copie_totali, c.copie_disponibili "
        "FROM Libri l "
        "JOIN Copie c ON l.id_libro = c.id_libro");
    
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        const char* error_response = "{\"status\": \"error\", \"message\": \"Errore nella query\"}";
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
        PQclear(res);
        PQfinish(conn);
        pthread_mutex_unlock(&db_mutex);
        return;
    }

    send(client_socket, response_headers, strlen(response_headers), 0);
    send(client_socket, "{\"status\": \"success\", \"libri\": [", strlen("{\"status\": \"success\", \"libri\": ["), 0);

    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char libro[1024];
        snprintf(libro, sizeof(libro),
                "{\"titolo\": \"%s\", \"autore\": \"%s\", \"genere\": \"%s\", \"copieTotali\": %s, \"copieDisponibili\": %s}%s",
                PQgetvalue(res, i, 0),
                PQgetvalue(res, i, 1),
                PQgetvalue(res, i, 2),
                PQgetvalue(res, i, 3),
                PQgetvalue(res, i, 4),
                i < rows - 1 ? "," : "");
        send(client_socket, libro, strlen(libro), 0);
    }

    send(client_socket, "]}", 2, 0);

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
}

void handle_inserimento_libro(int client_socket, char* buffer) {
    const char* response_headers = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: http://localhost:3000\r\n"
        "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Access-Control-Allow-Credentials: true\r\n"
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
    struct json_object *titolo, *autore, *genere, *copieTotali, *copieDisponibili;
    json_object_object_get_ex(parsed_json, "titolo", &titolo);
    json_object_object_get_ex(parsed_json, "autore", &autore);
    json_object_object_get_ex(parsed_json, "genere", &genere);
    json_object_object_get_ex(parsed_json, "copieTotali", &copieTotali);
    json_object_object_get_ex(parsed_json, "copieDisponibili", &copieDisponibili);

    const char *titolo_str = json_object_get_string(titolo);
    const char *autore_str = json_object_get_string(autore);
    const char *genere_str = json_object_get_string(genere);
    int copie_totali = json_object_get_int(copieTotali);
    int copie_disponibili = json_object_get_int(copieDisponibili);

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
        send(client_socket, response_headers, strlen(response_headers), 0);
        send(client_socket, error_response, strlen(error_response), 0);
    } else {
        int id_libro = atoi(PQgetvalue(res, 0, 0));

        char id_libro_str[12];
        char copie_totali_str[12];
        char copie_disponibili_str[12];

        sprintf(id_libro_str, "%d", id_libro);
        sprintf(copie_totali_str, "%d", copie_totali);
        sprintf(copie_disponibili_str, "%d", copie_disponibili);

        const char *paramValuesCopie[3] = {id_libro_str, copie_totali_str, copie_disponibili_str};
        res = PQexecParams(conn,
            "INSERT INTO Copie (id_libro, copie_totali, copie_disponibili) VALUES ($1, $2, $3)",
            3, NULL, paramValuesCopie, NULL, NULL, 0);

        if (PQresultStatus(res) != PGRES_COMMAND_OK) {
            const char* error_msg = PQresultErrorMessage(res);
            char error_response[512];
            snprintf(error_response, sizeof(error_response), 
                    "{\"status\": \"error\", \"message\": \"%s\"}", 
                    error_msg);
            send(client_socket, response_headers, strlen(response_headers), 0);
            send(client_socket, error_response, strlen(error_response), 0);
        } else {
            const char* success_response = "{\"status\": \"success\", \"message\": \"Libro inserito con successo\"}";
            send(client_socket, response_headers, strlen(response_headers), 0);
            send(client_socket, success_response, strlen(success_response), 0);
        }
    }

    PQclear(res);
    PQfinish(conn);
    pthread_mutex_unlock(&db_mutex);
    json_object_put(parsed_json);
}

void handle_options(int client_socket) {
    const char* options_response = 
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: http://localhost:3000\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Access-Control-Max-Age: 86400\r\n"
        "Content-Length: 0\r\n"
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
        } else if (strstr(buffer, "GET") != NULL) {
            handle_get_libri(client_socket);
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
        perror("Bind fallita");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, MAX_CLIENTS) < 0) {
        perror("Listen fallita");
        exit(EXIT_FAILURE);
    }

    printf("Server in ascolto sulla porta %d...\n", PORT);

    while (1) {
        int client_socket;
        if ((client_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen)) < 0) {
            perror("Accept fallita");
            continue;
        }

        ThreadArgs *args = malloc(sizeof(ThreadArgs));
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