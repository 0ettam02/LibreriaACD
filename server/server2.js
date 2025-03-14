const express = require('express');
const cors = require('cors');
const pool = require('./database'); // Assicurati che il percorso sia corretto

const app = express();
const port = 8087;

app.use(cors());
app.use(express.json()); 


app.delete('/eliminaLibro', async (req, res) => {
    const { userId, titolo } = req.query;

    try {
        const result = await pool.query(
            `DELETE FROM Prestiti WHERE id_utente = $1 AND id_libro = (SELECT id_libro FROM Libri WHERE titolo = $2)`,
            [userId, titolo]
        );

        if (result.rowCount > 0) {
            res.json({ status: 'success', message: 'Libro eliminato con successo' });
        } else {
            res.json({ status: 'error', message: 'Nessun libro trovato per l\'eliminazione' });
        }
    } catch (error) {
        console.error('Errore nella query di eliminazione:', error);
        res.status(500).json({ status: 'error', message: 'Errore nella query di eliminazione' });
    }
});

// Altri endpoint possono essere aggiunti qui

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});