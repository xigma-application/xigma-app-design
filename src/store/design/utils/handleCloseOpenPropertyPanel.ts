// types
import { TDesignState, TOpenPropertyPanel } from '../types';

export const handleCloseOpenPropertyPanel = (state: TDesignState, panel: TOpenPropertyPanel): void => {
  const open = state.openPropertyPanel;

  if (open && open.nodeId === panel.nodeId && open.property === panel.property && open.index === panel.index) {
    state.openPropertyPanel = null;
  }
};
