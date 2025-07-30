import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET_KEY = 'your_secret_key_here'; // Make sure this matches your login token secret

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // attach decoded user
    next();
  });
}

// GET /auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user); // return the user object from the token
});

export default router;
