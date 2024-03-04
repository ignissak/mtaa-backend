import { Router } from 'express';
import { IndexService } from '../services/index_service';

class IndexRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.get('/', IndexService.getPackageVersion);
  }
}

const indexRoutes = new IndexRoutes();
indexRoutes.init();

export default indexRoutes.router;
