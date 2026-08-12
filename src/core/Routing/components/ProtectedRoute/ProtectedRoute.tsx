import { FC, ReactNode } from 'react';

// types
import { TGuard } from '../../types';

export type TProtectedRouteProps = {
  children: ReactNode;
  guards?: Array<TGuard>;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({ children, guards = [] }) => {
  const failedGuard = guards.find(({ guardCheck }) => !guardCheck());

  if (failedGuard) {
    return failedGuard.renderFallback();
  }

  return children;
};

export default ProtectedRoute;
