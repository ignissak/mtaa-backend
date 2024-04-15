import { Router } from 'express';
import { AuthService } from '../../services/v1/auth_service';
import { PlacesService } from '../../services/v1/places_service';
import { Storage } from '../../utils/storage';

class PlacesRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get('', AuthService.requireLogin, PlacesService.searchPlaces);
    this.router.get(
      '/trending',
      AuthService.requireLogin,
      PlacesService.getTrendingPlaces,
    );

    this.router.get(
      '/:placeId',
      AuthService.requireLogin,
      PlacesService.getPlace,
    );

    this.router.get(
      '/visits/:userId',
      AuthService.requireLogin,
      PlacesService.getUserVisitedPlaces,
    );
    this.router.delete(
      '/visits/:placeId',
      AuthService.requireLogin,
      PlacesService.deleteVisitedPlace,
    );
    this.router.post(
      '/visits',
      AuthService.requireLogin,
      PlacesService.addVisitedPlace,
    );

    this.router.get(
      '/reviews/:placeId',
      AuthService.requireLogin,
      PlacesService.getPlaceReviews,
    );
    this.router.put(
      '/reviews/:placeId',
      AuthService.requireLogin,
      Storage.upload.single('image'),
      PlacesService.upsertPlaceReview,
    );
    this.router.delete(
      '/reviews/:placeId',
      AuthService.requireLogin,
      PlacesService.deletePlaceReview,
    );
    this.router.delete(
      '/places/:placeId',
      AuthService.requireLogin,
      PlacesService.removePlace,
    );
    this.router.put(
      '/places/:placeId/description',
      AuthService.requireLogin,
      PlacesService.updatePlaceDescription,
    );
    this.router.get(
      '/places/latest',
      AuthService.requireLogin,
      PlacesService.getLatestAddedPlaces,
    );
  }
}

const placesRoutes = new PlacesRoutes();

export default placesRoutes.router;
