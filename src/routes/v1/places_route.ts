import { Router } from 'express';
import { PlacesService } from '../../services/places_service';

class PlacesRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public init() {
    this.router.get('', PlacesService.searchPlaces);
    this.router.get('/trending', PlacesService.getTrendingPlaces);

    this.router.get('/visits/:userId', PlacesService.getUserVisitedPlaces);
    this.router.delete('/visits/:placeId', PlacesService.deleteVisitedPlace);
    this.router.post('/visits/:placeId', PlacesService.addVisitedPlace);
  }
}

const placesRoutes = new PlacesRoutes();
placesRoutes.init();

export default placesRoutes.router;
