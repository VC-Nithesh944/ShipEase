const { MongoClient } = require('mongodb');

const app = require('./app');

const uri = 'mongodb+srv://rishitmakadiacs23:FWDdemo@fwd.raps5.mongodb.net/' // Example: mongodb://localhost:27017
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
      userId: user._id,
    });
} catch (err) {
    res.status(500).send('Error saving data: ' + err.message);
}
});


const port = process.env.PORT || 1000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});