# Usa un'immagine base con un compilatore C (ad esempio Debian con GCC)
FROM debian:bullseye

# Installa gcc e make
RUN apt-get update && apt-get install -y gcc make

# Imposta la directory di lavoro nel contenitore
WORKDIR /app

# Copia i file del progetto nella directory del contenitore
COPY server/prova.c .

# Compila il programma (modifica "main.c" o "Makefile" come necessario)
RUN gcc -o app prova.c

# Comando predefinito per eseguire l'applicazione
CMD ["./app"]
