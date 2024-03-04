import express from 'express';
import index_route from './routes/index_route';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.routes();
  }

  private routes(): void {
    this.express.use('', index_route);
  }
}

export default new App().express;
