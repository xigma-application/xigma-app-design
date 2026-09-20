// types
import { TDesignState, TOpenPropertyPanel } from '../../types';

// utils
import { handleCloseOpenPropertyPanel } from '../handleCloseOpenPropertyPanel';

const panel: TOpenPropertyPanel = { index: 1, nodeId: 'node-1', property: 'strokes' };

const buildState = (openPropertyPanel: TOpenPropertyPanel | null): TDesignState => ({ openPropertyPanel }) as TDesignState;

describe('handleCloseOpenPropertyPanel', () => {
  it('should close the panel when the same node, property and index are named', () => {
    // Step 1: Prepare
    const state = buildState(panel);

    // Step 2: Close
    handleCloseOpenPropertyPanel(state, panel);

    // Step 3: Assert
    expect(state.openPropertyPanel).toBeNull();
  });

  it('should keep a panel that differs by index, property or node', () => {
    // Step 1: Prepare
    const state = buildState(panel);

    // Step 2: Close other panels
    handleCloseOpenPropertyPanel(state, { ...panel, index: 0 });
    handleCloseOpenPropertyPanel(state, { ...panel, property: 'fills' });
    handleCloseOpenPropertyPanel(state, { ...panel, nodeId: 'node-2' });

    // Step 3: Assert
    expect(state.openPropertyPanel).toEqual(panel);
  });

  it('should do nothing when no panel is open', () => {
    // Step 1: Prepare
    const state = buildState(null);

    // Step 2: Close
    handleCloseOpenPropertyPanel(state, panel);

    // Step 3: Assert
    expect(state.openPropertyPanel).toBeNull();
  });
});
