// types
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokedSelectionBounds } from '../getStrokedSelectionBounds';

vi.mock('../getStrokedRotatedNodeBounds', () => ({ getStrokedRotatedNodeBounds: (node: { bounds: unknown }): unknown => node.bounds }));

describe('getStrokedSelectionBounds', () => {
  it('should wrap the stroked bounds of every selected node', () => {
    // mock
    const nodes = [
      { bounds: { height: 10, width: 10, x: 0, y: 0 } },
      { bounds: { height: 5, width: 20, x: 20, y: -5 } },
    ] as unknown as TSceneNode[];

    // result
    expect(getStrokedSelectionBounds(nodes)).toEqual({ height: 15, width: 40, x: 0, y: -5 });
  });
});
