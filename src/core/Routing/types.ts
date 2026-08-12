import { ComponentType, LazyExoticComponent, ReactNode } from 'react';

// types
import { RouteName } from './constants/routes';

export type TGuard = {
  guardCheck: () => boolean;
  renderFallback: () => ReactNode;
};

export type TComponent = ComponentType | LazyExoticComponent<ComponentType>;

export type TAppRouteData = {
  Component: TComponent;
  guards?: Array<TGuard>;
  name: RouteName;
  titleKey: string;
};

export type TAppRoutesData = Array<TAppRouteData>;
