import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';

class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.post('/login', AuthService.login);
    this.router.post('/register', AuthService.register);
    //this.router.get('/logout', AuthService.logOut);
    this.router.get(
      '/protected',
      AuthService.requireLogin,
      AuthService.checkLogin,
    );
  }
}

const authRoutes = new AuthRoutes();

export default authRoutes.router;
