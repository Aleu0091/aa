const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:3000/myapp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// 데이터베이스 모델 정의 (회원 정보)
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 회원가입 엔드포인트
app.post('/register', async (req, res) => {
    try {
        // 클라이언트로부터의 요청에서 사용자 정보 추출
        const { username, email, password } = req.body;

        // MongoDB에 새로운 사용자 정보 저장
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '서버 에러: 회원가입 실패' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
