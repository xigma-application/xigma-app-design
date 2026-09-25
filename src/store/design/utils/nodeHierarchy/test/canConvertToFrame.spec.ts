// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { canConvertToFrame } from '../canConvertToFrame';

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
const makeSection = (id: string, childIds: string[], parentId: string | null = null): TSectionNode => ({
  ...box,
  childIds,
  fills: [],
  id,
  name: id,
  parentId,
  type: NodeType.section,
});
const rectangle: TRectangleNode = {
  ...box,
  fills: [],
  id: 'rectangle',
  name: 'rectangle',
  parentId: 'withRectangle',
  type: NodeType.rectangle,
};
const withRectangle = makeSection('withRectangle', ['rectangle', 'missing']);
const inner = makeSection('inner', [], 'withSection');
const withSection = makeSection('withSection', ['inner']);
const nodes: Record<string, TSceneNode> = { inner, rectangle, withRectangle, withSection };

describe('canConvertToFrame', () => {
  it('should allow sections whose children are not sections', () => {
    // action / result
    expect(canConvertToFrame([withRectangle, inner], nodes)).toBe(true);
  });

  it('should not allow a section that holds another section', () => {
    // action / result
    expect(canConvertToFrame([withRectangle, withSection], nodes)).toBe(false);
  });

  it('should not allow an empty selection, a missing node or a node that is not a section', () => {
    // action / result
    expect(canConvertToFrame([], nodes)).toBe(false);
    expect(canConvertToFrame([undefined], nodes)).toBe(false);
    expect(canConvertToFrame([inner, rectangle], nodes)).toBe(false);
  });
});
