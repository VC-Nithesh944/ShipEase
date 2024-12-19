const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const cors = require('cors');




const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Serve frontend files
const publicPath = path.join(__dirname, '../HTML Folder');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Login API
app.post('/api/login', (req, res) => {
    console.log('Login request received:', req.body); // Log incoming request
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Username or password missing');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length === 0) {
            console.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        console.log('Retrieved user:', user); // Log retrieved user details
        console.log('Sending login data:', { username, password });

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                console.error('Invalid credentials');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log('Login successful, token generated');
            res.json({ message: 'Login successful', token });
        } catch (error) {
            console.error('Error comparing password:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
});


// Signup API
app.post('/api/signup', async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ error: 'Error inserting user' });
            }

            res.status(201).json({ message: 'User successfully created' });
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
