import App from './app';
const listEndpoints = require('express-list-endpoints');

const app = App;

const formatEndpoint = (
  path: string,
  methods: string[],
  middlewares: string[],
) => {
  return `${methods.join(', ')} : ${path} [${middlewares.join(', ')}]`;
};

app.listen(3000, () => {
  console.log('Server is running on port 3000');

  const endpoints = listEndpoints(app);
  console.log('Registered endpoints:');
  endpoints.forEach((endpoint: any) => {
    console.log(
      formatEndpoint(endpoint.path, endpoint.methods, endpoint.middlewares),
    );
  });
});
