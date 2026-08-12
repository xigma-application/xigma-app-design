import { Route } from 'react-router';

// types
import { RouteName } from '../../constants/routes';
import { TAppRouteData } from '../../types';

// utils
import { renderRoute } from '../renderRoute';

describe('renderRoute', () => {
  it('should build a Route element for the given route data', () => {
    // mock
    const routeData: TAppRouteData = {
      Component: () => null,
      name: RouteName.home,
      titleKey: 'routing.title.home',
    };

    // before
    const route = renderRoute(routeData);

    // result
    expect(route.type).toBe(Route);
    expect(route.props.path).toBe('/');
    expect(route.key).toBe(RouteName.home);
  });
});
