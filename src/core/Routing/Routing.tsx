import { FC } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';

// components
import NotFoundPage from 'pages/NotFoundPage/NotFoundPage';
import RootLayout from './components/RootLayout/RootLayout';

// others
import { APP_ROUTES_DATA } from './constants/appRoutesData';

// utils
import { renderRoute } from './utils/renderRoute';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {APP_ROUTES_DATA.map(renderRoute)}
      <Route element={<NotFoundPage />} path="*" />
    </Route>,
  ),
);

export const Routing: FC = () => <RouterProvider router={router} />;

export default Routing;
