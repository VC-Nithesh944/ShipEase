
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const path = require('path');


require('dotenv').config();

// Middleware for parsing JSON
const app = express();
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Use process.env to get host from the .env file
    user: process.env.DB_USER, // Use process.env to get user from the .env file
    password: process.env.DB_PASSWORD, // Use process.env to get password from the .env file
    database: process.env.DB_NAME, // Use process.env to get DB name from the .env file
});



db.connect((err) => {
    if (err) {
        console.error('Database connection Failed: ', err.stack);
        return;
    }
    console.log('Connected to the database.');
    // No need to explicitly select the database since it's already defined in the connection
});




// Serving the frontend
const publicPath = path.join(__dirname, '../HTML Folder');
app.use(express.static(publicPath));

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Fetch the user from the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.username },
            process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

        res.json({ message: 'Login successful', token });
    });
});

// Signup API
// Example API route for user signup
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if password and confirm password match
    // (This validation should ideally happen in the client-side code)
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if the username already exists in the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
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
