// components
import DesignPage from 'pages/DesignPage/DesignPage';
import HomePage from 'pages/HomePage/HomePage';

// types
import { RouteName } from './routes';
import { TAppRoutesData } from '../types';

export const APP_ROUTES_DATA: TAppRoutesData = [
  {
    Component: DesignPage,
    name: RouteName.design,
    titleKey: 'routing.title.design',
  },
  {
    Component: HomePage,
    name: RouteName.home,
    titleKey: 'routing.title.home',
  },
];
