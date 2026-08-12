export enum RouteName {
  design = 'design',
  home = 'home',
}

export const ROUTES: Record<RouteName, string> = {
  [RouteName.design]: '/design/:id',
  [RouteName.home]: '/',
};
