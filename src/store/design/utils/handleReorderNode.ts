// types
import { TDesignState, TReorderPayload } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleReorderNode = (state: TDesignState, { fromIndex, toIndex }: TReorderPayload): void => {
  const page = getActivePage(state);
  const [movedId] = page.rootOrder.splice(fromIndex, 1);

  if (movedId) {
    page.rootOrder.splice(toIndex, 0, movedId);
  }
};
