// types
import { TDesignState } from '../types';
import { TViewport } from 'types/design/types';

export const handleSetViewport = (state: TDesignState, viewport: TViewport): void => {
  state.viewport = viewport;
};
