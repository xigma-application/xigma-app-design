import { FC, Suspense } from 'react';
import { Outlet } from 'react-router';

// components
import RouteTransitionLoader from '../RouteTransitionLoader/RouteTransitionLoader';
import Title from '../Title/Title';

export const RootLayout: FC = () => (
  <Suspense fallback={<RouteTransitionLoader />}>
    <Title />
    <Outlet />
  </Suspense>
);

export default RootLayout;
