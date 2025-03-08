#!/bin/bash

gcc -o inserimento_libro_server inserimento_libro_server.c -lpthread -ljson-c -lpq
gcc -o user_login_server user_login_server.c -lpthread -ljson-c -lpq
gcc -o user_registration_server user_registration_server.c -lpthread -ljson-c -lpq
gcc -o libri_profili libri_profili.c -lpthread -ljson-c -lpq
gcc -o libri_homepage libri_homepage.c -lpthread -ljson-c -lpq
gcc -o prenotazione_server prenotazione_server.c -lpthread -ljson-c -lpq

./user_registration_server 8080 &
./user_login_server 8081 &
./inserimento_libro_server 8082 &
./libri_profili 8083 &
./libri_homepage 8084 &
./prenotazione_server 8085 &

echo "Server avviati con successo!"
echo "Per terminare tutti i server, esegui: kill $(jobs -p)"