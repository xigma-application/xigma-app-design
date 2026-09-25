// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionCaptureIds } from '../getSectionCaptureIds';

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
  fill: '#444444',
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.section,
});

describe('getSectionCaptureIds', () => {
  it('should return the siblings that fit whole in the section, in their order', () => {
    // mock
    const section = makeSection('section', { height: 200, width: 200, x: 0, y: 0 });
    const nodes: Record<string, TSceneNode> = {
      inside: makeRectangle('inside', 10, 10),
      partial: makeRectangle('partial', 180, 10),
      second: makeRectangle('second', 100, 100),
      section,
    };

    // action / result
    expect(getSectionCaptureIds(section, nodes, ['second', 'inside', 'partial', 'section', 'missing'])).toEqual(['second', 'inside']);
  });

  it('should only look at the children of the parent section for a nested section', () => {
    // mock
    const outer = makeSection('outer', { height: 1000, width: 1000, x: 0, y: 0 }, ['inner', 'child']);
    const inner = makeSection('inner', { height: 200, width: 200, x: 0, y: 0 }, [], 'outer');
    const nodes: Record<string, TSceneNode> = {
      child: makeRectangle('child', 10, 10, 'outer'),
      inner,
      outer,
      topLevel: makeRectangle('topLevel', 20, 20),
    };

    // action / result
    expect(getSectionCaptureIds(inner, nodes, ['outer', 'topLevel'])).toEqual(['child']);
  });
});
