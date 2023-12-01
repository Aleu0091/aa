const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const app = express();
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://www.poayl.xyz'); // 요청한 출처를 허용
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const uri = 'mongodb+srv://ueged13:VmNMiFeGheGzPZPl@cluster0.zzctp0t.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let usersCollection;

async function connectToMongo() {
    try {
        await client.connect();
        const database = client.db('test');
        usersCollection = database.collection('users');
        console.log('Connected to MongoDB');
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
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await usersCollection.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: '유저를 찾을 수 없음' });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '이메일 또는 패스워드 에러' });
        }

        req.session.user = existingUser;

        return res.status(200).json({ message: '로그인 성공', userId: existingUser._id });
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: '이미 가입된 이메일 입니다.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username: username,
            email,
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: '가입 성공', userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: '가입중 오류' });
    }
});

app.post('/logout', (req, res) => {
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

app.post('/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'You are not logged in' });
    }
});

// File upload and course addition endpoint

// Server setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at localhost:${port}`);
});
