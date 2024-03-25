import { Router } from 'express';
import { IndexService } from '../../services/v1/index_service';

class IndexRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get('/', IndexService.getPackageVersion);
  }
}

const indexRoutes = new IndexRoutes();

export default indexRoutes.router;
