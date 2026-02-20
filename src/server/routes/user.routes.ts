import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await db.read();
    res.json({
      users: db.data.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await db.read();
    const user = db.data.users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, role } = req.body;
    await db.read();

    const userIndex = db.data.users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email) db.data.users[userIndex].email = email;
    if (role) db.data.users[userIndex].role = role;

    await db.write();

    res.json({
      message: 'User updated',
      user: {
        id: db.data.users[userIndex].id,
        username: db.data.users[userIndex].username,
        email: db.data.users[userIndex].email,
        role: db.data.users[userIndex].role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.read();
    const userIndex = db.data.users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (db.data.users[userIndex].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    db.data.users.splice(userIndex, 1);
    await db.write();

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
