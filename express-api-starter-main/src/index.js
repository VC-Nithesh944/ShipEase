const { MongoClient } = require('mongodb');
const app = require('./app');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { token } = require('morgan');
dotenv.config(); // Load environment variables from .env file

const nodemailer = require('nodemailer');
const { getMyTransporter } = require('./mailSender');

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

    const Otp = generateOTP();
    const collection = db.collection('Signup');
    const result = await collection.insertOne({ Name, Email, Password, Confirm, Otp, IsVerified:false });
    sendOtpVerification(Name, Email, Otp);
    // const collection = db.collection('Signup');
    // const result = await collection.insertOne({ Name, Email, Password, Confirm });

    res.status(201).send({
        message: 'User registered successfully!',
        userId: result.insertedId,
    });
} catch (err) {
    res.status(500).send('Error saving data: ' + err.message);
}
});

app.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;
  const collection = db.collection('Signup');
  const user = await collection.findOne({ Email: email });
  if (user.Otp == otp) {
    // Update the IsVerified field to true
    await collection.updateOne(
            { Email: email },
            { $set: { IsVerified: true } }
          );

    res.status(200).send({ "success": true });
    return;
  }
  res.status(400).send({ "success": false });
})

function generateOTP() {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp.padStart(6, '0');  // Ensure the OTP is always 6 characters long
}

app.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body;
    const collection = db.collection('Signup');
    const user = await collection.findOne({Email: email });
    if (!user) {
      return res.status(404).send('User not found.');
    }
    if (!user.IsVerified) {
      return res.status(401).send('User not verified.');
    }
    // Check if the password matches
    if (user.Password !== password) {
      return res.status(401).send('Invalid password.');
    }
    // Send successful login response
    res.status(200).send({
      message: 'Login-successful',

      // userId: user._id, 
      token: generateToken(user._id, user.Email),
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
function generateToken(userId, email) {
  return jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

app.post('/api/saveTransportData', authenticateToken, async (req, res) => {
  try {
    // const {}
    const {fromLocation, toLocation, bookingType, weight, length, width, height, totalPrice, bookingDate, deliveryDate} = req.body;

    const clientId = req.user.id;
    // Validate inputs
    if (!fromLocation || !toLocation || !bookingType || isNaN(weight) || isNaN(length) || isNaN(width) || isNaN(height) || !clientId || !bookingDate || !deliveryDate ) {
      res.status(400).send('Please enter all the fields');
      return;
    }

    const collection = db.collection('Transport'); // Replace with your collection name
    const data = await collection.insertOne({
      clientId, fromLocation, toLocation, bookingType, weight, length, width, height, totalPrice, bookingDate, deliveryDate
    })
    const mailResult = await sendTransportMail(req, req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send('Error fetching data: ' + err.message);
  }
});

app.get('/api/getMyTransportRequests', authenticateToken, async (req, res) => {
  try {
    const collection = db.collection('Transport'); // Replace with your collection name
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

async function sendTransportMail(req, details) {
  let transporter = await getMyTransporter();
  let user = req.user;
  let info = await transporter.sendMail({
    from: 'jayghetia106@gmail.com', // sender address
    to: user.email, // list of receivers
    subject:"Please verify the following transport request", // Subject line
    text: "", // plain text body 
    html: `<b>Hello ${user.email}</b> <br> 
    <p> Source Location - ${details.fromLocation}</p><br>
    <p> Destination Location - ${details.toLocation}</p><br>
    <p> Weight - ${details.weight}</p><br>
    <p> Length - ${details.length}</p><br>
    <p> width - ${details.width}</p><br>
    <p> height - ${details.height}</p><br>
    <p> Payable Amount - ${details.totalPrice}</p><br>
    <p> Booking Date - ${details.bookingDate}</p><br>
    <p> Delivery Date - ${details.deliveryDate}</p><br>
    `, // html body
  }); 
  return true;
}

async function sendOtpVerification(username, email, otp) {
  let transporter = await getMyTransporter();
  let info = await transporter.sendMail({
    from: 'rishitmakadia.cs23@bmsce.ac.in', // sender address
    to: email, // list of receivers
    subject:"Otp Verification Email", // Subject line
    text: "", // plain text body 
    html: `<b>Hello ${username}</b> <br> 
    <p> Your Otp is - <b> ${otp} </b></p><br>`, // html body
  }); 
  return true;
}

const port = process.env.PORT || 1000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});