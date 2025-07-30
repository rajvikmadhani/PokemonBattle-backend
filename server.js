import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;

const users = [];

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ========== USER ROUTES ==========

// GET all users (testing)
app.get('/users', (req, res) => {
  res.json(users);
});

// Register new user
app.post('/users', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: uuidv4(),
    username,
    email,
    password,
    roster: [],
    score: 0, // Add score property to match frontend API
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered', user: newUser });
});

// Login user
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = Buffer.from(user.id).toString('base64');

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  });
});

// Get current user by token
app.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const userId = Buffer.from(token, 'base64').toString();

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

// ========== LEADERBOARD ROUTES ==========

// GET full leaderboard
app.get('/leaderboard', (req, res) => {
  // Return array of users with id, username, and score (roster excluded for leaderboard)
  const leaderboard = users.map(u => ({
    id: u.id,
    username: u.username,
    score: u.score,
  }));
  res.json(leaderboard);
});

// GET user roster by user ID
app.get('/leaderboard/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ roster: user.roster });
});

// GET user score by user ID
app.get('/leaderboard/:id/score', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ score: user.score });
});

// PUT update user roster
app.put('/leaderboard/:id/roster', (req, res) => {
  const { id } = req.params;
  const { action, pokemonId } = req.body;

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.roster) user.roster = [];

  switch (action) {
    case 'add':
      if (!user.roster.includes(pokemonId)) {
        user.roster.push(pokemonId);
      }
      break;
    case 'remove':
      user.roster = user.roster.filter(pid => pid !== pokemonId);
      break;
    case 'reset':
      user.roster = [];
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  res.json({ message: 'Roster updated', roster: user.roster });
});

// Health check root
app.get('/', (req, res) => {
  res.send('🟢 Backend server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is live at http://localhost:${PORT}`);
});
