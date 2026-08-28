// types
import { NavItemName } from '../NavRail/types';

export type TPanelContentProps = {
  activeNavItem: NavItemName;
  name: string;
  onRenameFile: TFunc<[string]>;
};
