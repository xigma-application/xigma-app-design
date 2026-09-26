// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isStrokeSettingsNode } from '../isStrokeSettingsNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isStrokeSettingsNode', () => {
  it('should accept a vector and a styled node', () => {
    // result
    expect(isStrokeSettingsNode(makeSquareVector())).toBe(true);
    expect(isStrokeSettingsNode({ type: NodeType.polygon } as TSceneNode)).toBe(true);
  });

  it('should reject a text node and a missing one', () => {
    // result
    expect(isStrokeSettingsNode({ type: NodeType.text } as TSceneNode)).toBe(false);
    expect(isStrokeSettingsNode(undefined)).toBe(false);
  });
});
