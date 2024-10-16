const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
const PORT = 2002;

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass@word1',
    database: 'flightdb'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Get all flights or flights by airplane_id
app.get('/flight', (req, res) => {
    const airplaneId = req.query.airplane_id;

    let query = 'SELECT * FROM flights';
    const queryParams = [];

    if (airplaneId) {
        query += ' WHERE airplane_id = ?';
        queryParams.push(airplaneId);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching flights' });
        } else {
            res.json(results);
        }
    });
});

// Get flight by ID
app.get('/flight/:id', (req, res) => {
    db.query('SELECT * FROM flights WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching flight' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Flight not found with id' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new flight
app.post('/flight', (req, res) => {
    const { flight_name, airplane_id, category } = req.body;
    db.query('INSERT INTO flights (flight_name, airplane_id, category) VALUES (?, ?, ?)', 
        [flight_name, airplane_id, category], 
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Error creating flight' });
            } else {
                res.status(201).json({ message: 'Flight created successfully', id: result.insertId });
            }
        }
    );
});
// Get passengers for a specific flight ID
// Get passengers for a specific flight ID and airplane ID
app.get('/flight/:id/passengers/:airplaneId', async (req, res) => {
    const flightId = req.params.id;
    const airplaneId = req.params.airplaneId;

    try {
        // Make a request to the passenger service to fetch passengers for the flight ID and airplane ID
        const response = await axios.get(`http://localhost:2003/passengers/${flightId}/${airplaneId}`);
        const passengers = response.data;

        res.json(passengers);
    } catch (error) {
        console.error('Error fetching passengers:', error.message);
        return res.status(500).json({ error: 'Error fetching passengers' });
    }
});



app.listen(PORT, () => {
    console.log(`Flight service running on port ${PORT}`);
});
