const express = require('express');
const cors = require('cors');
const MQL5Parser = require('./parser');

const app = express();
const parser = new MQL5Parser();

app.use(cors());
app.use(express.json());

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
            [username, email, hashedPassword, 'user']
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при регистрации' });
    }
});

// Админские эндпоинты
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const result = await pool.query('SELECT id, username, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/api/admin/assign-signal', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const { userId, signalUrl } = req.body;
        await pool.query(
            'INSERT INTO user_signals (user_id, signal_id) VALUES ($1, $2)',
            [userId, signalUrl]
        );
        res.status(201).json({ message: 'Сигнал успешно назначен' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при назначении сигнала' });
    }
});

app.post('/api/parse', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL сигнала обязателен' });
        }

        const data = await parser.parseSignal(url);
        console.log(data);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Сервер парсера запущен на порту ${PORT}`);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.error(`Порт ${PORT} занят. Попробуйте другой порт или остановите процесс.`);
            process.exit(1);
        } else {
            console.error('Ошибка при запуске сервера:', error);
            process.exit(1);
        }
    }
};

startServer();