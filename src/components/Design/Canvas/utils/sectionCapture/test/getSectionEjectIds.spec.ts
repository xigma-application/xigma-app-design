// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionEjectIds } from '../getSectionEjectIds';

const makeRectangle = (id: string, x: number, y: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y,
});

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

describe('getSectionEjectIds', () => {
  it('should return the children that fit whole before the resize but not after it', () => {
    // mock
    const section = makeSection('section', { height: 100, width: 100, x: 0, y: 0 }, ['stays', 'leaves', 'wasOut', 'missing']);
    const nodes: Record<string, TSceneNode> = {
      leaves: makeRectangle('leaves', 120, 10, 'section'),
      section,
      stays: makeRectangle('stays', 10, 10, 'section'),
      wasOut: makeRectangle('wasOut', 280, 10, 'section'),
    };

    // action / result
    expect(getSectionEjectIds(section, { height: 300, width: 300, x: 0, y: 0 }, nodes)).toEqual(['leaves']);
  });
});
