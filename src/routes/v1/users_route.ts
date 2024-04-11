import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';
import { UsersService } from '../../services/v1/users_service';

class UsersRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
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
    this.router.get('/:userId', AuthService.requireLogin, UsersService.getUser);
    this.router.get(
      '/:userId/reviews',
      AuthService.requireLogin,
      UsersService.getUserReviews,
    );
  }
}

const usersRoutes = new UsersRoutes();

export default usersRoutes.router;
