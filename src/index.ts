import { Express } from 'express';
import listEndpoints from 'express-list-endpoints';
import App from './app';
import { Cron } from './cron';
const app = App;

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');

  const endpoints = listEndpoints(app as Express);
  console.log('Registered endpoints:');
  endpoints.forEach((endpoint: Endpoint) => {
    console.log(
      formatEndpoint(endpoint.path, endpoint.methods, endpoint.middlewares),
    );
  });

  new Cron();
});
