import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';
import { UsersService } from '../../services/v1/users_service';

class UsersRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.post(
      '/settings',
      AuthService.requireLogin,
      UsersService.updateSettings,
    );
    this.router.post(
      '/password',
      AuthService.requireLogin,
      UsersService.updatePassword,
    );
  }
}

const usersRoutes = new UsersRoutes();
usersRoutes.init();

export default usersRoutes.router;
