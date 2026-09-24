// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { isSelectionFromOneParent } from '../utils/isSelectionFromOneParent';

export const useIsSelectionFromOneParent = (): boolean => isSelectionFromOneParent(useAppSelector(selectSelectedNodes));
