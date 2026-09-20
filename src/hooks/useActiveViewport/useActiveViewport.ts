// store
import { RootState, useAppSelector } from 'store';
import { selectViewport } from 'store/design/selectors';

// types
import { TViewport } from 'types/design/types';

const IDLE_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };

export const useActiveViewport = (isActive: boolean): TViewport =>
  useAppSelector((state: RootState) => (isActive ? selectViewport(state) : IDLE_VIEWPORT));
