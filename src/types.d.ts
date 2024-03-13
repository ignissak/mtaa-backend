import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare global {
  namespace Express {
    export interface Request {
      auth?: auth.User;
    }
  }
}
declare namespace auth {
  export type User = {
    userId: number;
  };
}
