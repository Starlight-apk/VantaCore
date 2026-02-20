import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = Router();

interface AppDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: string;
  image: string;
  port: number;
  env?: Record<string, string>;
  volumes?: string[];
  cmd?: string[];
  docker?: boolean;
  installScript?: string;
  uninstallScript?: string;
}

const appStore: AppDefinition[] = [
  {
    id: 'nginx',
    name: 'Nginx',
    description: '高性能的 HTTP 和反向代理服务器',
    version: '1.25.3',
    author: 'Nginx Inc.',
    icon: 'nginx',
    category: 'Web 服务器',
    image: 'nginx:latest',
    port: 80,
    docker: true,
    volumes: ['/data/nginx/html:/usr/share/nginx/html', '/data/nginx/conf:/etc/nginx/conf.d'],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: '最流行的开源关系型数据库',
    version: '8.0.35',
    author: 'Oracle',
    icon: 'mysql',
    category: '数据库',
    image: 'mysql:8.0',
    port: 3306,
    docker: true,
    env: { MYSQL_ROOT_PASSWORD: 'root123' },
    volumes: ['/data/mysql:/var/lib/mysql'],
  },
  {
    id: 'redis',
    name: 'Redis',
    description: '高性能的键值存储数据库',
    version: '7.2.3',
    author: 'Redis Ltd.',
    icon: 'redis',
    category: '数据库',
    image: 'redis:7-alpine',
    port: 6379,
    docker: true,
    volumes: ['/data/redis:/data'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: '流行的 NoSQL 文档数据库',
    version: '7.0.4',
    author: 'MongoDB Inc.',
    icon: 'mongodb',
    category: '数据库',
    image: 'mongo:7',
    port: 27017,
    docker: true,
    volumes: ['/data/mongodb:/data/db'],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: '强大的开源对象关系型数据库',
    version: '16.1',
    author: 'PostgreSQL Global',
    icon: 'postgres',
    category: '数据库',
    image: 'postgres:16',
    port: 5432,
    docker: true,
    env: { POSTGRES_PASSWORD: 'postgres123' },
    volumes: ['/data/postgres:/var/lib/postgresql/data'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: '基于 Chrome V8 引擎的 JavaScript 运行时',
    version: '20.10.0',
    author: 'Node.js Foundation',
    icon: 'nodejs',
    category: '运行环境',
    image: 'node:20-alpine',
    port: 3000,
    docker: true,
  },
  {
    id: 'python',
    name: 'Python',
    description: '流行的编程语言',
    version: '3.12.1',
    author: 'Python Software Foundation',
    icon: 'python',
    category: '运行环境',
    image: 'python:3.12-slim',
    port: 8000,
    docker: true,
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    description: '流行的内容管理系统',
    version: '6.4.2',
    author: 'WordPress Foundation',
    icon: 'wordpress',
    category: 'CMS',
    image: 'wordpress:latest',
    port: 8080,
    docker: true,
    env: { WORDPRESS_DB_HOST: 'mysql', WORDPRESS_DB_USER: 'wordpress', WORDPRESS_DB_PASSWORD: 'wordpress123' },
    volumes: ['/data/wordpress:/var/www/html'],
  },
  {
    id: 'phpmyadmin',
    name: 'phpMyAdmin',
    description: 'MySQL 数据库管理工具',
    version: '5.2.1',
    author: 'phpMyAdmin Project',
    icon: 'phpmyadmin',
    category: '工具',
    image: 'phpmyadmin:latest',
    port: 8081,
    docker: true,
    env: { PMA_HOST: 'mysql' },
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: '轻量级的 Docker 管理界面',
    version: '2.19.4',
    author: 'Portainer.io',
    icon: 'portainer',
    category: '工具',
    image: 'portainer/portainer-ce:latest',
    port: 9000,
    docker: true,
    volumes: ['/data/portainer:/data', '/var/run/docker.sock:/var/run/docker.sock'],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: '开源的数据可视化和监控平台',
    version: '10.2.3',
    author: 'Grafana Labs',
    icon: 'grafana',
    category: '监控',
    image: 'grafana/grafana:latest',
    port: 3001,
    docker: true,
    volumes: ['/data/grafana:/var/lib/grafana'],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: '开源监控系统',
    version: '2.48.1',
    author: 'Prometheus Project',
    icon: 'prometheus',
    category: '监控',
    image: 'prom/prometheus:latest',
    port: 9090,
    docker: true,
    volumes: ['/data/prometheus:/prometheus'],
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    description: '分布式搜索和分析引擎',
    version: '8.11.3',
    author: 'Elastic',
    icon: 'elasticsearch',
    category: '搜索',
    image: 'elasticsearch:8.11.3',
    port: 9200,
    docker: true,
    volumes: ['/data/elasticsearch:/usr/share/elasticsearch/data'],
  },
  {
    id: 'kibana',
    name: 'Kibana',
    description: 'Elasticsearch 的数据可视化界面',
    version: '8.11.3',
    author: 'Elastic',
    icon: 'kibana',
    category: '搜索',
    image: 'kibana:8.11.3',
    port: 5601,
    docker: true,
    env: { ELASTICSEARCH_HOSTS: 'http://elasticsearch:9200' },
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: '完整的 DevOps 平台',
    version: '16.6.2',
    author: 'GitLab Inc.',
    icon: 'gitlab',
    category: '开发工具',
    image: 'gitlab/gitlab-ce:latest',
    port: 8888,
    docker: true,
    volumes: ['/data/gitlab/config:/etc/gitlab', '/data/gitlab/logs:/var/log/gitlab', '/data/gitlab/data:/var/opt/gitlab'],
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: '流行的 CI/CD 工具',
    version: '2.426.3',
    author: 'Jenkins Project',
    icon: 'jenkins',
    category: '开发工具',
    image: 'jenkins/jenkins:lts',
    port: 8082,
    docker: true,
    volumes: ['/data/jenkins:/var/jenkins_home'],
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: '企业级文件同步和协作平台',
    version: '28.0.1',
    author: 'Nextcloud GmbH',
    icon: 'nextcloud',
    category: '云存储',
    image: 'nextcloud:latest',
    port: 8083,
    docker: true,
    volumes: ['/data/nextcloud:/var/www/html'],
  },
  {
    id: 'transmission',
    name: 'Transmission',
    description: '轻量级 BitTorrent 客户端',
    version: '4.0.5',
    author: 'Transmission Project',
    icon: 'transmission',
    category: '下载',
    image: 'linuxserver/transmission:latest',
    port: 9091,
    docker: true,
    volumes: ['/data/transmission:/config', '/downloads:/downloads'],
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    description: '功能丰富的 BitTorrent 客户端',
    version: '4.6.1',
    author: 'qBittorrent Project',
    icon: 'qbittorrent',
    category: '下载',
    image: 'linuxserver/qbittorrent:latest',
    port: 8084,
    docker: true,
    volumes: ['/data/qbittorrent:/config', '/downloads:/downloads'],
  },
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    description: '开源的智能家居平台',
    version: '2023.12.3',
    author: 'Home Assistant',
    icon: 'homeassistant',
    category: '智能家居',
    image: 'homeassistant/home-assistant:latest',
    port: 8123,
    docker: true,
    volumes: ['/data/homeassistant:/config'],
  },
];

router.get('/list', (req, res) => {
  try {
    const { category } = req.query;
    
    let apps = appStore;
    if (category) {
      apps = apps.filter(app => app.category === category);
    }

    const categories = [...new Set(appStore.map(app => app.category))];

    res.json({
      apps,
      categories,
      total: appStore.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get app list' });
  }
});

router.get('/detail/:id', (req, res) => {
  try {
    const app = appStore.find(a => a.id === req.params.id);
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    res.json({ app });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get app detail' });
  }
});

router.get('/installed', async (req, res) => {
  try {
    await db.read();
    res.json({ apps: db.data.apps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get installed apps' });
  }
});

router.post('/install', async (req, res) => {
  try {
    const schema = z.object({
      appId: z.string(),
      name: z.string().optional(),
      port: z.number().optional(),
      config: z.record(z.any()).optional(),
    });

    const { appId, name, port, config } = schema.parse(req.body);
    
    const appDef = appStore.find(a => a.id === appId);
    if (!appDef) {
      return res.status(404).json({ error: 'App not found' });
    }

    await db.read();

    const existingInstall = db.data.apps.find(a => a.appId === appId);
    if (existingInstall) {
      return res.status(400).json({ error: 'App already installed' });
    }

    const newApp = {
      id: uuidv4(),
      appId,
      name: name || appDef.name,
      version: appDef.version,
      status: 'installing' as const,
      port: port || appDef.port,
      config: config || {},
      installedAt: new Date().toISOString(),
    };

    db.data.apps.push(newApp);
    await db.write();

    // Simulate installation (in real implementation, this would use Docker or run scripts)
    setTimeout(async () => {
      await db.read();
      const appIndex = db.data.apps.findIndex(a => a.id === newApp.id);
      if (appIndex !== -1) {
        db.data.apps[appIndex].status = 'running';
        await db.write();
      }
    }, 3000);

    res.json({
      message: 'App installation started',
      app: newApp,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to install app' });
  }
});

router.post('/uninstall/:id', async (req, res) => {
  try {
    await db.read();
    const appIndex = db.data.apps.findIndex(a => a.id === req.params.id);
    
    if (appIndex === -1) {
      return res.status(404).json({ error: 'App not found' });
    }

    db.data.apps.splice(appIndex, 1);
    await db.write();

    res.json({ message: 'App uninstalled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall app' });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    await db.read();
    const appIndex = db.data.apps.findIndex(a => a.id === req.params.id);
    
    if (appIndex === -1) {
      return res.status(404).json({ error: 'App not found' });
    }

    db.data.apps[appIndex].status = 'running';
    await db.write();

    res.json({ message: 'App started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start app' });
  }
});

router.post('/:id/stop', async (req, res) => {
  try {
    await db.read();
    const appIndex = db.data.apps.findIndex(a => a.id === req.params.id);
    
    if (appIndex === -1) {
      return res.status(404).json({ error: 'App not found' });
    }

    db.data.apps[appIndex].status = 'stopped';
    await db.write();

    res.json({ message: 'App stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop app' });
  }
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(appStore.map(app => app.category))];
  res.json({ categories });
});

export default router;
