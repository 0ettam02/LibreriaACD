const express = require('express');
const cors = require('cors');
const pool = require('./database'); // Assicurati che il percorso sia corretto

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

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});