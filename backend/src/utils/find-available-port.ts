import { createServer } from 'node:net';

/** Find the first free TCP port starting at `start` (3000 → 3001 → 3002 …). */
export function findAvailablePort(start: number, host = '0.0.0.0'): Promise<number> {
  return new Promise((resolve, reject) => {
    const tryPort = (port: number) => {
      const server = createServer();
      server.unref();
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') tryPort(port + 1);
        else reject(err);
      });
      server.listen(port, host, () => {
        server.close((closeErr) => {
          if (closeErr) reject(closeErr);
          else resolve(port);
        });
      });
    };
    tryPort(start);
  });
}
