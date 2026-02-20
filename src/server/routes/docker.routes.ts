import { Router } from 'express';
import Docker from 'dockerode';
import { z } from 'zod';

const router = Router();

let docker: Docker | null = null;

function getDocker(): Docker {
  if (!docker) {
    docker = new Docker();
  }
  return docker;
}

function checkDockerEnabled(): boolean {
  return process.env.DOCKER_ENABLED === 'true';
}

router.get('/info', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const info = await docker.info();
    
    res.json({
      enabled: true,
      info: {
        containers: info.Containers,
        containersRunning: info.ContainersRunning,
        containersPaused: info.ContainersPaused,
        containersStopped: info.ContainersStopped,
        images: info.Images,
        driver: info.Driver,
        kernelVersion: info.KernelVersion,
        operatingSystem: info.OperatingSystem,
        architecture: info.Architecture,
        serverVersion: info.ServerVersion,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get Docker info' });
  }
});

router.get('/containers', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const containers = await docker.listContainers({ all: true });
    
    res.json({
      containers: containers.map(c => ({
        id: c.Id.substring(0, 12),
        name: c.Names[0]?.replace(/^\//, '') || '',
        image: c.Image,
        imageId: c.ImageID,
        command: c.Command,
        created: c.Created,
        state: c.State,
        status: c.Status,
        ports: c.Ports,
        labels: c.Labels,
        mounts: c.Mounts,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list containers' });
  }
});

router.post('/containers', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const schema = z.object({
      name: z.string().optional(),
      image: z.string(),
      cmd: z.array(z.string()).optional(),
      Env: z.array(z.string()).optional(),
      ExposedPorts: z.record(z.object({})).optional(),
      HostConfig: z.object({
        PortBindings: z.record(z.array(z.object({ HostPort: z.string() }))).optional(),
        Binds: z.array(z.string()).optional(),
        Memory: z.number().optional(),
        CpuShares: z.number().optional(),
        RestartPolicy: z.object({
          Name: z.enum(['no', 'always', 'on-failure', 'unless-stopped']),
          MaximumRetryCount: z.number().optional(),
        }).optional(),
        NetworkMode: z.string().optional(),
      }).optional(),
    });

    const config = schema.parse(req.body);
    const docker = getDocker();
    
    const container = await docker.createContainer({
      ...config,
      name: config.name,
    });

    await container.start();

    res.json({
      id: container.id.substring(0, 12),
      name: config.name || container.id.substring(0, 12),
      message: 'Container created and started',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to create container' });
  }
});

router.post('/containers/:id/start', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    await container.start();
    
    res.json({ message: 'Container started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start container' });
  }
});

router.post('/containers/:id/stop', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    await container.stop();
    
    res.json({ message: 'Container stopped' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to stop container' });
  }
});

router.post('/containers/:id/restart', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    await container.restart();
    
    res.json({ message: 'Container restarted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to restart container' });
  }
});

router.delete('/containers/:id', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    await container.remove({ force: true });
    
    res.json({ message: 'Container deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete container' });
  }
});

router.get('/containers/:id/logs', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: parseInt(req.query.tail as string) || 100,
    });

    res.json({ logs: logs.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get logs' });
  }
});

router.get('/images', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const images = await docker.listImages();
    
    res.json({
      images: images.map(img => ({
        id: img.Id,
        repoTags: img.RepoTags || [],
        size: img.Size,
        created: img.Created,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list images' });
  }
});

router.post('/images', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const schema = z.object({
      name: z.string(),
      tag: z.string().default('latest'),
    });

    const { name, tag } = schema.parse(req.body);
    const docker = getDocker();
    
    const stream = await docker.pull(`${name}:${tag}`);
    
    res.json({ message: `Image ${name}:${tag} pulled successfully` });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to pull image' });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    await docker.getImage(req.params.id).remove();
    
    res.json({ message: 'Image deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
});

router.get('/networks', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const networks = await docker.listNetworks();
    
    res.json({ networks });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list networks' });
  }
});

router.get('/volumes', async (req, res) => {
  try {
    if (!checkDockerEnabled()) {
      return res.status(403).json({ error: 'Docker is not enabled' });
    }

    const docker = getDocker();
    const volumes = await docker.listVolumes();
    
    res.json({ volumes });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list volumes' });
  }
});

export default router;
