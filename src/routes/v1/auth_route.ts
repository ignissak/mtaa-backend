import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';

class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.post('/login', AuthService.login);
    this.router.post('/register', AuthService.register);
    //this.router.get('/logout', AuthService.logOut);
    this.router.get(
      '/protected',
      AuthService.requireLogin,
      async (req, res) => {
        res.status(200).send('You are logged in');
      },
    );
  }
}

const authRoutes = new AuthRoutes();
authRoutes.init();

export default authRoutes.router;
