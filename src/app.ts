import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import auth_route from './routes/v1/auth_route';
import index_route from './routes/v1/index_route';
import places_route from './routes/v1/places_route';
import users_route from './routes/v1/users_route';
import leaderboard_route from './routes/v1/leaderboard_route';

dotenv.config();

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));

    this.routes();
  }

  private routes(): void {
    this.express.use('/v1', index_route);
    this.express.use('/v1/auth', auth_route);
    this.express.use('/v1/places', places_route);
    this.express.use('/v1/users', users_route);
    this.express.use('/v1/leaderboard', leaderboard_route);
  }
}

export default new App().express;
