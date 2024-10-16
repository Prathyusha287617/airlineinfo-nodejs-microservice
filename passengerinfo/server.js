const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
const PORT = 2003;

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass@word1',
    database: 'passengerdb'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('MySQL connected successfully');
    }
});

// Create a new passenger
app.post('/passengers', (req, res) => {
    const { passenger_name, passenger_number, flight_id, airplane_id } = req.body;

    // Insert passenger
    db.query('INSERT INTO passengers (passenger_name, passenger_number, flight_id, airplane_id) VALUES (?, ?, ?, ?)',
        [passenger_name, passenger_number, flight_id, airplane_id],
        (err, result) => {
            if (err) {
                console.error('Error details:', err);
                return res.status(500).json({ error: 'Error creating passenger' });
            }
            res.status(201).json({ message: 'Passenger created successfully', id: result.insertId });
        }
    );
});

// Get all passengers for a specific flight and airplane
app.get('/passengers', (req, res) => {
    const { flight_id, airplane_id } = req.query;

    let query = 'SELECT * FROM passengers WHERE 1=1';
    const queryParams = [];

    if (flight_id) {
        query += ' AND flight_id = ?';
        queryParams.push(flight_id);
    }

    if (airplane_id) {
        query += ' AND airplane_id = ?';
        queryParams.push(airplane_id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching passengers' });
        }
        res.json(results);
    });
});

// Get passengers by flight ID and airplane ID
app.get('/passengers/:flightId/:airplaneId', (req, res) => {
    const flightId = req.params.flightId;
    const airplaneId = req.params.airplaneId;

    db.query('SELECT * FROM passengers WHERE flight_id = ? AND airplane_id = ?', [flightId, airplaneId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching passengers' });
        }
        res.json(results);
    });
});



// Get passenger by ID
app.get('/passenger/:id', (req, res) => {
    db.query('SELECT * FROM passengers WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching passenger' });
        } else if (results.length === 0) {
            return res.status(404).json({ error: 'Passenger not found' });
        }
        res.json(results[0]);
    });
});

app.listen(PORT, () => {
    console.log(`Passenger service running on port ${PORT}`);
});
