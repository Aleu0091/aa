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

// Passport 로컬 전략 설정
passport.use(
    new LocalStrategy(async (username, password, done) => {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/login'
    })
);

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

// profile 엔드포인트 수정
app.post('/logout', (req, res) => {
    req.logout();
    res.send('Logged out successfully');
});

function requireLogin(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ error: '로그인이 필요합니다' });
    }
}

app.get('/profile', requireLogin, (req, res) => {
    res.json(req.session.user);
});

// File upload and course addition

// Server setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at localhost:${port}`);
});
