// types
import { RouteName, ROUTES } from '../constants/routes';

export const getRouteByName = (name: RouteName): string => ROUTES[name];
