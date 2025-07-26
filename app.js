import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';
import User from './usermodel.js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());


/**
 * Routes
 */
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './view' });
});

app.get('/api', (req, res) => {
  res.send('API is running...');
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const now = new Date();
    const user = new User({
      name,
      email,
      password,
      role,
      created_at: now,
      updated_at: now,
    });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (role !== undefined) user.role = role;
    user.updated_at = new Date();

    await user.save();
    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
