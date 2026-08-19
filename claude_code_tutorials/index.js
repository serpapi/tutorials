import { createServer } from 'http';

const PORT = 3000;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!\n');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
