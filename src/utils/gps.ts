export class GPS {
  // function to convert degrees to radians
  public static degToRad(deg: number) {
    return deg * (Math.PI / 180);
  }

  // function to calculate distance in meters using Haversine formula
  public static async getDistanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const earthRadius = 6371; // radius of the Earth in kilometers
    const dLat = GPS.degToRad(lat2 - lat1);
    const dLon = GPS.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(GPS.degToRad(lat1)) *
        Math.cos(GPS.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = earthRadius * c;
    const distanceInMeters = distanceInKm * 1000; // convert to meters
    return distanceInMeters;
  }
}
