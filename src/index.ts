import { Express } from 'express';
import listEndpoints from 'express-list-endpoints';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import App from './app';
import { Cron } from './cron';
import Sockets from './sockets';
const app = App;

const server = createServer(app);

type Endpoint = {
  path: string;
  methods: string[];
  middlewares: string[];
};

const formatEndpoint = (
  path: string,
  methods: string[],
  middlewares: string[],
) => {
  return `${methods.join(', ')} \t: ${path} [${middlewares.join(', ')}]`;
};

const io = new Server(server, { cors: { origin: 'http://localhost' } });
const sockets = new Sockets(io);

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');

  const endpoints = listEndpoints(app as Express);
  console.log('Registered endpoints:');
  endpoints.forEach((endpoint: Endpoint) => {
    console.log(
      formatEndpoint(endpoint.path, endpoint.methods, endpoint.middlewares),
    );
  });

  new Cron();

  sockets.setup();
});

export { sockets };
