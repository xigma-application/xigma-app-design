// types
import { NavItemName } from '../types';

export const useSelectNavItem = (setActiveNavItem: (value: NavItemName) => void): ((value: string) => void) => {
  return (value: string): void => {
    if (value) {
      setActiveNavItem(value as NavItemName);
    }
  };
};
