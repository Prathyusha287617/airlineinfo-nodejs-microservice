const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
const PORT = 2001;

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass@word1',
    database: 'airplanedb'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Get all airplanes
app.get('/airplane', (req, res) => {
    db.query('SELECT * FROM airplanes', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching airplanes' });
        } else {
            res.json(results);
        }
    });
});

// Get airplane by ID
app.get('/airplane/:id', (req, res) => {
    db.query('SELECT * FROM airplanes WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching airplane' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Airplane not found with id' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new airplane
app.post('/airplane', (req, res) => {
    const { name, country, numofflights } = req.body;
    db.query('INSERT INTO airplanes (name, country, numofflights) VALUES (?, ?, ?)', 
        [name, country, numofflights], 
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Error creating airplane' });
            } else {
                res.status(201).json({ message: 'Airplane created successfully', id: result.insertId });
            }
        }
    );
});

// Get airplane details along with flights and passengers
app.get('/airplane/details/:id', async (req, res) => {
    const airplaneId = req.params.id;

    try {
        // Fetch airplane details
        const [airplaneResults] = await db.promise().query('SELECT * FROM airplanes WHERE id = ?', [airplaneId]);
        
        if (airplaneResults.length === 0) {
            return res.status(404).json({ error: 'Airplane not found' });
        }

        // Fetch flights from flightinfo service
        const flightInfoResponse = await axios.get(`http://localhost:2002/flight?airplane_id=${airplaneId}`);
        const flights = flightInfoResponse.data;

        // For each flight, fetch associated passengers
        const passengersPromises = flights.map(async (flight) => {
            const passengerResponse = await axios.get(`http://localhost:2003/passengers/${flight.id}/${airplaneId}`);
            return {
                flight,
                passengers: passengerResponse.data
            };
        });

        const flightsWithPassengers = await Promise.all(passengersPromises);

        res.json({
            airplane: airplaneResults[0],
            flights: flightsWithPassengers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching airplane details, flights, or passengers' });
    }
});

app.listen(PORT, () => {
    console.log(`Airplane service running on port ${PORT}`);
});
