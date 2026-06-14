import * as Location from 'expo-location';

import {
  formatCoordinates,
  manhattanDistanceMeters,
  manhattanRouteCoords,
  resolveReadableAddress,
  sortByManhattanDistance,
} from '../../utils/geoUtils';

jest.mock('expo-location', () => ({
  reverseGeocodeAsync: jest.fn(),
}));

const reverseGeocodeAsync = Location.reverseGeocodeAsync as jest.MockedFunction<
  typeof Location.reverseGeocodeAsync
>;

describe('geo utilities', () => {
  beforeEach(() => {
    reverseGeocodeAsync.mockReset();
  });

  it('formats coordinates to five decimal places', () => {
    expect(formatCoordinates({ latitude: 14.5995124, longitude: 120.9842228 })).toBe(
      '14.59951, 120.98422',
    );
  });

  it('calculates Manhattan distance and sorts nearest items first', () => {
    const origin = { latitude: 14.5, longitude: 121.0 };
    const near = { id: 'near', latitude: 14.5001, longitude: 121.0001 };
    const far = { id: 'far', latitude: 14.6, longitude: 121.2 };

    expect(manhattanDistanceMeters(origin, near)).toBeGreaterThan(0);
    expect(sortByManhattanDistance(origin, [far, near])).toEqual([near, far]);
  });

  it('builds a two-leg route that starts and ends at the expected points', () => {
    const origin = { latitude: 10, longitude: 20 };
    const destination = { latitude: 12, longitude: 24 };
    const route = manhattanRouteCoords(origin, destination, 2);

    expect(route).toHaveLength(5);
    expect(route[0]).toEqual(origin);
    expect(route[2]).toEqual({ latitude: 12, longitude: 20 });
    expect(route[4]).toEqual(destination);
  });

  it('resolves readable addresses from reverse geocode results', async () => {
    reverseGeocodeAsync.mockResolvedValue([
      {
        name: 'Barangay Hall',
        street: 'Main Street',
        city: 'Manila',
        subregion: 'Manila',
        region: 'Metro Manila',
        country: 'Philippines',
      },
    ] as Location.LocationGeocodedAddress[]);

    await expect(resolveReadableAddress({ latitude: 14.6, longitude: 120.98 })).resolves.toBe(
      'Barangay Hall, Main Street, Manila, Metro Manila, Philippines',
    );
  });

  it('falls back to formatted coordinates when reverse geocoding has no usable address', async () => {
    reverseGeocodeAsync.mockResolvedValue([{}] as Location.LocationGeocodedAddress[]);

    await expect(resolveReadableAddress({ latitude: 14.6, longitude: 120.98 })).resolves.toBe(
      '14.60000, 120.98000',
    );
  });

  it('falls back to formatted coordinates when reverse geocoding fails', async () => {
    reverseGeocodeAsync.mockRejectedValue(new Error('offline'));

    await expect(resolveReadableAddress({ latitude: 14.6, longitude: 120.98 })).resolves.toBe(
      '14.60000, 120.98000',
    );
  });
});
