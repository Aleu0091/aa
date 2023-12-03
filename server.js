const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();

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
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToMongo();
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://www.poayl.xyz');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    next();
}); //
// 세션 설정
app.use(
    session({
        secret: 'dfgsdgjvfdslgjm',
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy 설정
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await usersCollection.findOne({ email });

            if (!user) {
                return done(null, false, { message: "can't find user" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return done(null, false, { message: 'email or password error' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
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
    } catch (error) {
        done(error);
    }
});

// 회원가입 엔드포인트
app.post('/signup', async (req, res) => {
    const { username: signupUsername, email: signupEmail, password: signupPassword } = req.body;

    const existingUser = await usersCollection.findOne({ email: signupEmail });
    if (existingUser) {
        return res.status(409).json({ message: 'already signup email' });
    }

    try {
        const hashedPassword = await bcrypt.hash(signupPassword, 10);

        const newUser = {
            username: signupUsername,
            email: signupEmail,
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'singup', userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: 'error while signup' });
    }
});

// 로그인 엔드포인트
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure' }), (req, res) => {
    // Manually call req.login() to save the authenticated state
    req.login(req.user, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error during login' });
        }
        return res.status(200).json({ message: '로그인 성공' });
    });
});

// 로그아웃 엔드포인트
app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'error while logout' });
        }
        res.header('Access-Control-Allow-Origin', 'https://www.poayl.xyz'); // 클라이언트 도메인 설정
        res.header('Access-Control-Allow-Credentials', true); // 인증 정보 허용
        res.send('success logout'); // 클라이언트에게 로그아웃 성공을 응답합니다.
    });
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'you need login' });
}

// profile 라우트에 isAuthenticated 함수 적용
app.get('/profile', isAuthenticated, (req, res) => {
    res.json(req.user);
});

// 서버 설정
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`서버가 localhost:${port}에서 실행 중입니다.`);
});
