const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결 설정
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

// Passport 및 LocalStrategy 설정
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const existingUser = await usersCollection.findOne({ email: username });
            if (!existingUser) {
                return done(null, false, { message: '유저를 찾을 수 없음' });
            }

            const passwordMatch = await bcrypt.compare(password, existingUser.password);
            if (!passwordMatch) {
                return done(null, false, { message: '이메일 또는 패스워드 에러' });
            }
            return done(null, existingUser);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersCollection.findOne({ _id: id });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// 세션 설정
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

app.use(passport.initialize());
app.use(passport.session());

// 회원가입 엔드포인트
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

// 로그인 엔드포인트
app.post('/login', passport.authenticate('local'), (req, res) => {
    res.status(200).json({ message: '로그인 성공' });
});

// 로그아웃 엔드포인트
app.post('/logout', (req, res) => {
    req.logout();
    res.status(200).json({ message: '로그아웃 성공' });
});

// 프로필 엔드포인트
app.get('/profile', requireLogin, (req, res) => {
    res.send(req.user);
});

function requireLogin(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ error: '로그인이 필요합니다' });
    }
}

// 서버 설정
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`서버가 localhost:${port}에서 실행 중입니다.`);
});
