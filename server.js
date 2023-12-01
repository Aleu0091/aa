const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const multer = require('multer');

const app = express();
const corsOptions = {
    origin: 'https://www.poayl.xyz',
    credentials: true
};

app.use(cors(corsOptions));

const uri = 'mongodb+srv://ueged13:VmNMiFeGheGzPZPl@cluster0.zzctp0t.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let usersCollection;
let coursesCollection;

async function connectToMongo() {
    try {
        await client.connect();
        const database = client.db('test');
        usersCollection = database.collection('users');
        coursesCollection = database.collection('courses');
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Add course endpoint
app.post('/addCourse', async (req, res) => {
    const { id, title, description } = req.body;

    try {
        // MongoDB에 강의 정보를 삽입합니다.
        const newCourse = { id, title, description };
        const result = await coursesCollection.insertOne(newCourse);

        if (result.insertedId) {
            res.status(201).json({ message: '강의 추가 성공', courseId: result.insertedId });
        } else {
            res.status(500).json({ message: '강의 추가 중 오류' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

// Course details endpoint
app.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        // MongoDB에서 해당 ID에 해당하는 강의 데이터를 가져옵니다.
        const course = await coursesCollection.findOne({ id: Number(courseId) });

        if (!course) {
            res.status(404).json({ message: 'Course not found' });
        } else {
            res.json(course);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching course data from MongoDB' });
    }
});

// File upload and course addition endpoint
app.post('/courses', upload.single('file'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const file = req.file;

        // MongoDB에 강의 정보 및 파일 정보 저장
        const result = await coursesCollection.insertOne({
            title,
            description,
            filename: file.originalname,
            path: file.path
        });

        res.status(201).json({ message: 'Course added successfully', courseId: result.insertedId });
    } catch (err) {
        res.status(500).json({ message: 'Error adding course' });
    }
});

// Server setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at localhost:${port}`);
});
