// types
import { TDesignState } from '../types';
import { TViewport } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';

export const handleSetViewport = (state: TDesignState, viewport: TViewport): void => {
  getActivePage(state).viewport = viewport;
};
