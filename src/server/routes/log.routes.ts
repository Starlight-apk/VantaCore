import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await db.read();
    res.json({
      logs: db.data.logs.slice(-100).reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.get('/level/:level', async (req, res) => {
  try {
    await db.read();
    const logs = db.data.logs
      .filter(log => log.level === req.params.level)
      .slice(-100)
      .reverse();

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.post('/clear', async (req, res) => {
  try {
    await db.read();
    db.data.logs = [];
    await db.write();

    res.json({ message: 'Logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

export default router;
