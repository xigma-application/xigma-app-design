// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isNestedSection } from '../isNestedSection';

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
const makeSection = (id: string, parentId: string | null): TSectionNode => ({
  ...box,
  childIds: [],
  fills: [],
  id,
  name: id,
  parentId,
  type: NodeType.section,
});
const frame: TFrameNode = {
  ...box,
  childIds: [],
  clipContent: true,
  fills: [],
  id: 'frame',
  name: 'frame',
  parentId: null,
  type: NodeType.frame,
};
const outer = makeSection('outer', null);
const nodes: Record<string, TSceneNode> = { frame, outer };

describe('isNestedSection', () => {
  it('should be true for a section whose parent is a section', () => {
    // result
    expect(isNestedSection(makeSection('inner', 'outer'), nodes)).toBe(true);
  });

  it('should be false for a top-level section, a section in another parent, a missing parent or a node that is not a section', () => {
    // result
    expect(isNestedSection(outer, nodes)).toBe(false);
    expect(isNestedSection(makeSection('inFrame', 'frame'), nodes)).toBe(false);
    expect(isNestedSection(makeSection('orphan', 'missing'), nodes)).toBe(false);
    expect(isNestedSection({ ...frame, parentId: 'outer' }, nodes)).toBe(false);
  });
});
