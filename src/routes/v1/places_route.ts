import { Router } from 'express';
import { PlacesService } from '../../services/v1/places_service';

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

    this.router.get('/reviews/:placeId', PlacesService.getPlaceReviews);
    this.router.put('/reviews/:placeId', PlacesService.upsertPlaceReview);
    this.router.delete('/reviews/:placeId', PlacesService.deletePlaceReview);
  }
}

const placesRoutes = new PlacesRoutes();
placesRoutes.init();

export default placesRoutes.router;
