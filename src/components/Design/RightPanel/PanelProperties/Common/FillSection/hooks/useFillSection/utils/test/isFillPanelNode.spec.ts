// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFillPanelNode } from '../isFillPanelNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isFillPanelNode', () => {
  it('should accept a vector for fills and strokes', () => {
    // result
    expect(isFillPanelNode(makeSquareVector(), 'fills')).toBe(true);
    expect(isFillPanelNode(makeSquareVector(), 'strokes')).toBe(true);
  });

  it('should accept a styled node and reject a missing one', () => {
    // result
    expect(isFillPanelNode({ type: NodeType.rectangle } as TSceneNode, 'fills')).toBe(true);
    expect(isFillPanelNode(undefined, 'fills')).toBe(false);
  });
});
