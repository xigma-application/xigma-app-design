import { ReactElement } from 'react';
import { Route, RouteProps } from 'react-router';

// components
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// types
import { TAppRouteData } from '../types';

// utils
import { getRouteByName } from './getRouteByName';

export const renderRoute = ({ Component, guards, name }: TAppRouteData): ReactElement<RouteProps> => (
  <Route
    element={
      <ProtectedRoute guards={guards}>
        <Component />
      </ProtectedRoute>
    }
    key={name}
    path={getRouteByName(name)}
  />
);
