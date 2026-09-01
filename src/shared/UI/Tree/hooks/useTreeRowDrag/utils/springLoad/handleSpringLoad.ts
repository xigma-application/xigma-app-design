// others
import { TREE_SPRING_LOAD_DELAY_MS } from '../../constants';

// types
import { TTreeDragState } from '../../types';

// utils
import { clearSpringLoad } from './clearSpringLoad';

export const handleSpringLoad = (dragState: TTreeDragState, itemId: string): void => {
  if (dragState.springLoadRef.current?.itemId !== itemId) {
    clearSpringLoad(dragState.springLoadRef);

    const timerId = window.setTimeout(() => dragState.onSpringLoadExpandRef.current?.(itemId), TREE_SPRING_LOAD_DELAY_MS);
    dragState.springLoadRef.current = { itemId, timerId };
  }
};
