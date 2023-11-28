const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));
app.options('www.poayl.xyz', cors());

const uri = 'mongodb+srv://ueged13:VmNMiFeGheGzPZPl@cluster0.zzctp0t.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let usersCollection;

async function connectToMongo() {
    try {
        await client.connect();
        const database = client.db('yourDatabaseName');
        usersCollection = database.collection('users');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

connectToMongo();

app.use(
    session({
        secret: 'ajdonnnxkanklaoiendjdikdo',
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            email,
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Registration successful', userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: 'Error during registration' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const allUsers = await usersCollection.find().toArray();
        res.json(allUsers);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        req.session.user = user;
        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send('Failed to log out');
            } else {
                res.clearCookie('connect.sid');
                res.send('Logged out successfully');
            }
        });
    } else {
        res.status(401).send('Not logged in');
    }
});

app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'You are not logged in' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
