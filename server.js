const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');

const PORT = process.env.PORT || 3000;

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://www.poayl.xyz');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    next();
}); // Connect to the SQLite database (create if it doesn't exist)
const db = new sqlite3.Database('data.db');
app.use(
    session({
        secret: 'ajdonnnxkanklaoiendjdikdo', // 실제 프로덕션 환경에서는 보안을 위해 더 복잡한 값 사용
        resave: false,
        saveUninitialized: false
    })
);

// Create a table 'users' if it doesn't exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT)');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 모든 경로에 대해 CORS를 허용하는 간단한 설정

// Signup endpoint

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // 이메일 중복 확인
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (row) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        try {
            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password, 10);

            // 해싱된 비밀번호를 데이터베이스에 저장
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function (err) {
                    if (err) {
                        res.status(500).json({ message: 'Failed to register user' });
                    } else {
                        res.status(201).json({ message: '가입 성공!', userId: this.lastID });
                    }
                }
            );
        } catch (err) {
            res.status(500).json({ message: 'Error during registration' });
        }
    });
});

// Endpoint to get all users from the database (for testing)
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 사용자 이메일로 데이터베이스에서 사용자 찾기
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 비밀번호 검증
        const passwordMatch = await bcrypt.compare(password, row.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // 로그인 성공
        req.session.user = row; // 세션에 사용자 정보 저장

        return res.status(200).json({ message: 'Login successful', userId: row.id });
    });
});
// 로그아웃 라우트
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send('세션 삭제 실패');
            } else {
                res.clearCookie('connect.sid'); // 세션 쿠키 삭제
                res.send('로그아웃 되었습니다.');
            }
        });
    } else {
        res.status(401).send('로그인되어 있지 않습니다.');
    }
});

// 사용자 정보 확인 라우트
app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user); // 세션에 사용자 정보를 JSON으로 반환
    } else {
        res.status(401).json({ error: 'You are not logged in' }); // JSON 형식의 오류 메시지 반환
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
