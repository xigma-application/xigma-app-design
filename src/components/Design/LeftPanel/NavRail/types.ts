export enum NavItemName {
  agents = 'agents',
  assets = 'assets',
  file = 'file',
  tools = 'tools',
  variables = 'variables',
}

export type TNavRailProps = {
  activeNavItem: NavItemName;
  onSelectNavItem: (value: NavItemName) => void;
};
