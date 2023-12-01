const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8080;
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));

const uri = 'mongodb+srv://ueged13:VmNMiFeGheGzPZPl@cluster0.zzctp0t.mongodb.net/?retryWrites=true&w=majority'; // 여기에 MongoDB 연결 문자열을 넣어주세요
const client = new MongoClient(uri);

let usersCollection;

async function connectToMongo() {
    try {
        await client.connect();
        const database = client.db('test');
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
        return res.status(409).json({ message: '이미 가입된 이메일 입니다.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            email,
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: '가입 성공', userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: '가입중 오류' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없음' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '이메일 또는 패스워드 에러' });
        }

        req.session.user = user;

        return res.status(200).json({ message: '로그인 성공', userId: user._id });
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
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

// 서버 시작 (특정 IP 주소와 포트로 설정)
app.listen(8000, () => {
    console.log(`Server is running at localhost:8000`);
});
