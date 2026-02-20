import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await db.read();
    res.json({ config: db.data.config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { hostname, timezone, dockerEnabled, autoStart, theme } = req.body;
    await db.read();

    if (db.data.config.length === 0) {
      db.data.config.push({
        id: '1',
        hostname: hostname || '',
        timezone: timezone || 'UTC',
        dockerEnabled: dockerEnabled || false,
        autoStart: autoStart || true,
        theme: theme || 'dark',
      });
    } else {
      if (hostname) db.data.config[0].hostname = hostname;
      if (timezone) db.data.config[0].timezone = timezone;
      if (dockerEnabled !== undefined) db.data.config[0].dockerEnabled = dockerEnabled;
      if (autoStart !== undefined) db.data.config[0].autoStart = autoStart;
      if (theme) db.data.config[0].theme = theme;
    }

    await db.write();

    res.json({ message: 'Config updated', config: db.data.config[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

export default router;
