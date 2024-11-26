const express = require('express');
const mysql = require('mysql2/promise');

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'test123',
            database: 'gesture_bot',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async createUser(user) {
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        try {
            await this.pool.query(query, [user.username, user.password]);
            return true;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new Error('Username already exists');
            }
            throw new Error('Database error');
        }
    }

    async authenticateUser(user) {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        try {
            const [results] = await this.pool.query(query, [user.username, user.password]);
            return results.length > 0;
        } catch (err) {
            throw new Error('Database error');
        }
    }

    async updateSensorData(username, data) {
        const query = 'UPDATE users SET sensor_data = ? WHERE username = ?';
        try {
            await this.pool.query(query, [data, username]);
            return true;
        } catch (err) {
            throw new Error('Database error');
        }
    }
    
    async getSensorData(username) {
        const query = 'SELECT distance_cm FROM ir_sensor_readings ORDER BY RAND() LIMIT 1';
        try {
            const [results] = await this.pool.query(query);
            return results[0]?.distance_cm;
        } catch (err) {
            throw new Error('Database error');
        }
    }
}

class AuthController {
    constructor(database) {
        this.database = database;
    }

    async signup(req, res) {
        try {
            const user = new User(req.body.username, req.body.password);
            await this.database.createUser(user);
            res.status(201).json({ message: 'User created successfully' });
        } catch (err) {
            if (err.message === 'Username already exists') {
                res.status(400).json({ message: err.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    }

    async login(req, res) {
        try {
            const user = new User(req.body.username, req.body.password);
            const isValid = await this.database.authenticateUser(user);
            
            if (isValid) {
                res.status(200).json({ 
                    message: 'Login successful',
                    username: user.username 
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

const app = express();
app.use(express.json());
app.use(express.static('./'));

const database = new Database();
const authController = new AuthController(database);

app.post('/api/signup', (req, res) => authController.signup(req, res));
app.post('/api/login', (req, res) => authController.login(req, res));

app.post('/api/sensor', async (req, res) => {
    try {
        await database.updateSensorData(req.body.username, req.body.data);
        res.status(200).json({ message: 'Data updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/sensor/:username', async (req, res) => {
    try {
        const data = await database.getSensorData(req.params.username);
        res.status(200).json({ data });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});