import express from 'express';
import index_route from './routes/index_route';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import bodyParser from 'body-parser';
import session from 'express-session';
import prisma from './db';
import auth_route from './routes/auth_route';
import dotenv from 'dotenv';

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
          maxAge: 20 *365 * 24 * 60 * 60 * 1000, // 20 years, lol
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
    this.express.use('', index_route);
    this.express.use('/auth', auth_route);
  }
}

export default new App().express;
