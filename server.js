const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
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
        saveUninitialized: false,
        cookie: {
            sameSite: 'None',
            secure: true
        }
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/login', async (req, res) => {
    const { email: loginEmail, password: loginPassword } = req.body;

    try {
        const existingUser = await usersCollection.findOne({ email: loginEmail });
        if (!existingUser) {
            return res.status(404).json({ message: '유저를 찾을 수 없음' });
        }

        const passwordMatch = await bcrypt.compare(loginPassword, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '이메일 또는 패스워드 에러' });
        }
        var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7); // 24 hour 7일
        res.cookie('email', loginEmail, { expires: expiryDate, httpOnly: true, signed: true });

        return res.status(200).json({ message: '로그인 성공', userId: existingUser._id });
    } catch (err) {
        return res.status(500).json({ message: 'Database error' });
    }
});

app.post('/signup', async (req, res) => {
    const { username: signupUsername, email: signupEmail, password: signupPassword } = req.body;

    const existingUser = await usersCollection.findOne({ email: signupEmail });
    if (existingUser) {
        return res.status(409).json({ message: '이미 가입된 이메일 입니다.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(signupPassword, 10);

        const newUser = {
            username: signupUsername,
            email: signupEmail,
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: '가입 성공', userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: '가입중 오류' });
    }
});

app.post('/logout', (req, res) => {
    // 쿠키를 클리어하여 로그아웃
    res.clearCookie('email');
    res.redirect('/');
    res.send('Logged out successfully');
});

// profile 엔드포인트 수정
app.get('/profile', (req, res) => {
    // 쿠키에서 사용자 정보를 가져옴
    var cookieLoginObj = req.signedCookies.email;

    if (cookieLoginObj && cookieLoginObj.email !== '') {
        res.status(200).json({ email });
    } else {
        res.status(401).send('Not logged in');
    }
});

// File upload and course addition

// Server setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at localhost:${port}`);
});
