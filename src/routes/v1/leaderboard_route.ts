import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';
import { LeaderboardService } from '../../services/v1/leaderboard_service';

class LeaderboardRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get(
      '',
      AuthService.requireLogin,
      LeaderboardService.getTopLast30Days,
    );
    this.router.get(
      '/overall',
      AuthService.requireLogin,
      LeaderboardService.getTopOverall,
    );
    this.router.get(
      '/:userId',
      AuthService.requireLogin,
      LeaderboardService.getUserPosition,
    );
    this.router.get(
      '/users',
      AuthService.requireLogin,
      LeaderboardService.getAllUsers,
    );
  }
}

const leaderboardRoutes = new LeaderboardRoutes();

export default leaderboardRoutes.router;
