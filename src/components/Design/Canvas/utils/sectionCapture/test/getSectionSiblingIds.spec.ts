// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionSiblingIds } from '../getSectionSiblingIds';

const makeSection = (
  id: string,
  box: { height: number; width: number; x: number; y: number },
  childIds: string[] = [],
  parentId: string | null = null,
): TSectionNode => ({
  ...box,
  childIds,
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.section,
});

describe('getSectionSiblingIds', () => {
  it('should return the page order for a top-level section', () => {
    // mock
    const section = makeSection('section', { height: 10, width: 10, x: 0, y: 0 });

    // action / result
    expect(getSectionSiblingIds(section, { section }, ['a', 'section'])).toEqual(['a', 'section']);
  });

  it('should return the parent section children for a nested section', () => {
    // mock
    const outer = makeSection('outer', { height: 10, width: 10, x: 0, y: 0 }, ['inner', 'b']);
    const inner = makeSection('inner', { height: 10, width: 10, x: 0, y: 0 }, [], 'outer');
    const nodes: Record<string, TSceneNode> = { inner, outer };

    // action / result
    expect(getSectionSiblingIds(inner, nodes, ['outer'])).toEqual(['inner', 'b']);
  });
});
