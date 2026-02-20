import { Router } from 'express';
import pty from 'node-pty';
import { WebSocketService } from '../services/websocket.service.js';

const router = Router();

interface TerminalSession {
  id: string;
  pty: pty.IPty;
  createdAt: Date;
  lastActivity: Date;
}

const sessions: Map<string, TerminalSession> = new Map();

router.post('/create', (req, res) => {
  try {
    const { cwd = process.env.HOME || '/home', shell = process.env.SHELL || '/bin/bash' } = req.body;
    
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd,
      env: process.env as { [key: string]: string },
    });

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    sessions.set(sessionId, {
      id: sessionId,
      pty: ptyProcess,
      createdAt: new Date(),
      lastActivity: new Date(),
    });

    res.json({ sessionId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resize', (req, res) => {
  try {
    const { sessionId, cols, rows } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.pty.resize(cols, rows);
    session.lastActivity = new Date();
    
    res.json({ message: 'Terminal resized' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/close', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.pty.kill();
    sessions.delete(sessionId);
    
    res.json({ message: 'Terminal closed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    lastActivity: s.lastActivity,
  }));
  
  res.json({ sessions: sessionList });
});

// Cleanup inactive sessions periodically
setInterval(() => {
  const now = Date.now();
  const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
  
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity.getTime() > maxInactiveTime) {
      session.pty.kill();
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export default router;
