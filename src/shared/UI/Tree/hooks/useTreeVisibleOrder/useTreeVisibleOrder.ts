import { useContext } from 'react';

// others
import { TreeVisibleOrderContext } from './context';

export const useTreeVisibleOrder = (): string[] => useContext(TreeVisibleOrderContext);
