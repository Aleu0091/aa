const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // CORS 모듈 추가
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the SQLite database (create if it doesn't exist)
const db = new sqlite3.Database('data.db');

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
        return res.status(200).json({ message: 'Login successful', userId: row.id });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
