// types
import { TTab } from '../types';

export const useTabClick =
  (setActiveTab: TFunc<[TTab['name']]>) =>
  (tab: TTab): TFunc =>
  () => {
    if (!tab.disabled) {
      setActiveTab(tab.name);
    }
  };
