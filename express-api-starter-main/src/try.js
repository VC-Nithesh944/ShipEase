const { MongoClient } = require('mongodb');
const app = require('./app');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { token } = require('morgan');
dotenv.config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URL; // Example: mongodb://localhost:27017
const client = new MongoClient(uri);

async function connectDB() {
  try {
      await client.connect();
      console.log('Connected to MongoDB successfully!');
      const db = client.db('LS'); // Specify your database name
    // console.log(db);
    return db;
  } catch (err) {
      console.error('Error connecting to MongoDB:', err);
  }
}

let db;

connectDB().then(database => {
    db = database;
}).catch(err => console.error(err));

// Example route to get data from a MongoDB collection
// app.get('/data', async (req, res) => {
//     try {
//         const collection = db.collection('FWD'); // Replace with your collection name
//         const data = await collection.find({}).toArray();
//         res.status(200).json(data);
//     } catch (err) {
//         res.status(500).send('Error fetching data: ' + err.message);
//     }
// });

app.get('/getAllCustomers', async (req, res) => {
  try {
      const collection = db.collection('Signup'); // Specify the collection name
      const customers = await collection.find({}).toArray(); // Fetch all documents
      res.status(200).json(customers); // Send the data as JSON response
  } catch (err) {
      res.status(500).send('Error fetching data: ' + err.message);
  }
});

app.post('/registerUser', async (req, res) => {
  try {
    const { Name, Email, Password, Confirm } = req.body;

    // Validate request payload
    if (!Name || !Email || !Password || !Confirm) {
        return res.status(400).send('All fields are required.');
    }

    if (Password !== Confirm) {
        return res.status(400).send('Password and Confirm fields must match.');
    }

    const collection = db.collection('Signup');
    const result = await collection.insertOne({ Name, Email, Password, Confirm });

    res.status(201).send({
        message: 'User registered successfully!',
        userId: result.insertedId,
    });
} catch (err) {
    res.status(500).send('Error saving data: ' + err.message);
}
});

app.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body;
    const collection = db.collection('Signup');
    const user = await collection.findOne({Email: email });
    if (!user) {
      return res.status(404).send('User not found.');
    }
    // Check if the password matches
    if (user.Password !== password) {
      return res.status(401).send('Invalid password.');
    }
    // Send successful login response
    res.status(200).send({
      message: 'Login-successful',
      token: generateToken(user._id, user.Password),
    });
} catch (err) {
    res.status(500).send('Error saving data: ' + err.message);
}
});

app.get('/getAllUser', authenticateToken, async (req, res) => {
  try {
    const collection = db.collection('Signup'); // Replace with your collection name
    const data = await collection.find({}).toArray();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send('Error fetching data: ' + err.message);
  }
});


// Generate JWT Token function
function generateToken(userId, username) {
  return jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

app.post('/api/saveTransportData', authenticateToken, async (req, res) => {
  try {
    // const {}
    const {fromLocation, toLocation, bookingType, weight, length, width, height, price} = req.body;

    const clientId = req.user.id;
    // Validate inputs
    if (!fromLocation || !toLocation || !bookingType || isNaN(weight) || isNaN(length) || isNaN(width) || isNaN(height) || !clientId) {
      res.status(400).send('Please enter all the fields');
      return;
    }

    const collection = db.collection('transport'); // Replace with your collection name
    const data = await collection.insertOne({
      clientId, fromLocation, toLocation, bookingType, weight, length, width, height, totalPrice
    })
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send('Error fetching data: ' + err.message);
  }
});


app.get('/api/getMyTransportRequests', authenticateToken, async (req, res) => {
  try {
    const collection = db.collection('transport'); // Replace with your collection name
    const data = await collection.find({clientId:req.user.id}).toArray();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send('Error fetching data: ' + err.message);
  }
});

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
      return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
  });
}


const port = process.env.PORT || 1000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});