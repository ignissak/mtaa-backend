import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import prisma from './db';
import auth_route from './routes/v1/auth_route';
import index_route from './routes/v1/index_route';
import places_route from './routes/v1/places_route';

dotenv.config();

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(
      session({
        secret: process.env.SECRET as string,
        resave: true,
        saveUninitialized: true,
        cookie: {
          maxAge: 20 * 365 * 24 * 60 * 60 * 1000, // 20 years, lol
        },
        store: new PrismaSessionStore(prisma, {
          checkPeriod: 2 * 60 * 1000, //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }),
      }),
    );

    this.routes();
  }

  private routes(): void {
    this.express.use('/v1', index_route);
    this.express.use('/v1/auth', auth_route);
    this.express.use('/v1/places', places_route);
  }
}

export default new App().express;
