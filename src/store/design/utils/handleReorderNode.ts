// types
import { TDesignState, TReorderNodesPayload } from '../types';

// utils
import { getActivePage } from './getActivePage';

export const handleReorderNode = (state: TDesignState, { fromIndices, toIndex }: TReorderNodesPayload): void => {
  const page = getActivePage(state);
  const movedIds = fromIndices.map((index) => page.rootOrder[index]).filter((id): id is string => Boolean(id));
  const remainingOrder = page.rootOrder.filter((_, index) => !fromIndices.includes(index));

  page.rootOrder = [...remainingOrder.slice(0, toIndex), ...movedIds, ...remainingOrder.slice(toIndex)];
};
