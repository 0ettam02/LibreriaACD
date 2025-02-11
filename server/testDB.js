const pool = require('./database');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connesso con successo:', res.rows[0]);

    const insertQuery = `
      INSERT INTO Utenti (username, password, email, nome, cognome, data_nascita)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      'matteo123',                 
      'password123',               
      'matteo@example.com',        
      'Matteo',                    
      'Rossi',                     
      '1990-05-20'                 
    ];

    const result = await pool.query(insertQuery, values);
    console.log('Nuovo utente inserito:', result.rows[0]);

  } catch (err) {
    console.error('Errore di connessione o query:', err);
  } finally {
    pool.end();
  }
}

testConnection();
