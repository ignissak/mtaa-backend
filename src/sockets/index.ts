import { Server } from 'socket.io';
import prisma from '../db';
import { AuthService } from '../services/v1/auth_service';
import { PlacesService } from '../services/v1/places_service';

export default class Sockets {
  public io: Server;
  constructor(io: Server) {
    this.io = io;
    console.log('Sockets initialized');
  }

  public setup() {
    this.io.use(async (socket, next) => {
      try {
        // Add authentication here
        const token =
          socket.handshake.auth.token || socket.handshake.headers.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        const verify = await AuthService.verifyAccessToken(token as string);
        if (!verify) {
          return next(new Error('Authentication error'));
        }
        socket.data.auth = verify;
        next();
      } catch (err) {
        next(err as Error);
      }
    });

    this.io.on('connection', (socket) => {
      console.log('A user connected', socket.data);

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });

      socket.on('place:subscribe', async (data) => {
        /**
         * User wants to subscribe to place changes
         * Place changes only include visit count and average rating
         */
        if (!data.placeId) {
          socket.emit('place:subscribed', {
            success: false,
            error: 'Place ID is required',
          });
          return;
        }

        const place = await prisma.place.findUnique({
          where: {
            id: parseInt(data.placeId),
          },
        });

        if (!place) {
          socket.emit('place:subscribed', {
            success: false,
            error: 'Place not found',
          });
          return;
        }

        const visits = await PlacesService.getPlaceVisits(data.placeId);
        const averageRating = await PlacesService.getPlaceAverageRating(
          data.placeId,
        );

        socket.join(`place:${place.id}`);
        socket.emit('place:subscribed', {
          success: true,
          data: {
            id: place.id,
            socket: `place:${place.id}`,
            visits,
            averageRating,
          },
        });
      });
    });

    console.log('Sockets setup');
  }

  public async emitPlaceUpdate(placeId: number) {
    const visits = await PlacesService.getPlaceVisits(placeId);
    const averageRating = await PlacesService.getPlaceAverageRating(placeId);

    this.io.to(`place:${placeId}`).emit('place:updated', {
      id: placeId,
      visits,
      averageRating,
    });

    console.log('Emitting place update', placeId);
  }
}
