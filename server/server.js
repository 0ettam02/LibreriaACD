const express = require('express');
const cors = require('cors');
const pool = require('./database'); 

const app = express();
const port = 8086;

app.use(cors());
app.use(express.json()); 

app.get('/statistiche', async (req, res) => {
    const titolo = req.query.titolo;

    try {
        const result = await pool.query(
            `SELECT P.id_utente, P.data_prestito, P.data_scadenza, P.id_libro 
             FROM prestiti AS P 
             INNER JOIN libri AS L ON P.id_libro = L.id_libro 
             WHERE L.titolo = $1`, [titolo]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore nella query:', error);
        res.status(500).json({ status: 'error', message: 'Errore nella query' });
    }
});

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


app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});