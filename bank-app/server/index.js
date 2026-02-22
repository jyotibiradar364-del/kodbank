const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware for auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access Denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// API: Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        balance: 10000 // Default balance
      }
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Balance (Protected)
app.get('/api/balance', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { balance: true }
    });
    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Balance Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Transfer (Protected)
app.post('/api/transfer', authenticateToken, async (req, res) => {
  try {
    const { receiverEmail, amount } = req.body;
    const senderId = req.user.id;
    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    // Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get sender balance safely
      const sender = await tx.user.findUnique({ where: { id: senderId } });
      if (sender.balance < transferAmount) {
          throw new Error('Insufficient balance');
      }

      // 2. Get receiver
      const receiver = await tx.user.findUnique({ where: { email: receiverEmail } });
      if (!receiver) {
          throw new Error('Receiver not found');
      }
      
      if (sender.id === receiver.id) {
          throw new Error('Cannot transfer to yourself');
      }

      // 3. Deduct from sender
      const updatedSender = await tx.user.update({
          where: { id: senderId },
          data: { balance: { decrement: transferAmount } }
      });

      // 4. Add to receiver
      await tx.user.update({
          where: { id: receiver.id },
          data: { balance: { increment: transferAmount } }
      });

      return updatedSender;
    });

    res.json({ message: 'Transfer successful', newBalance: result.balance });
  } catch (error) {
    console.error('Transfer Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
