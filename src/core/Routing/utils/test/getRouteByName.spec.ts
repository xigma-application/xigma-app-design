// types
import { RouteName } from '../../constants/routes';

// utils
import { getRouteByName } from '../getRouteByName';

describe('getRouteByName', () => {
  it('should return the path for the given route name', () => {
    // before
    const path = getRouteByName(RouteName.home);

    // result
    expect(path).toBe('/');
  });
});
