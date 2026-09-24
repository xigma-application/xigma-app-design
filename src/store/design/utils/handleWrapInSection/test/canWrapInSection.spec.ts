// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { canWrapInSection } from '../canWrapInSection';

const makeRectangle = (id: string, parentId: string | null): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const section: TSectionNode = {
  childIds: [],
  fill: '#ffffff',
  height: 10,
  id: 'section',
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 10,
  x: 0,
  y: 0,
};

describe('canWrapInSection', () => {
  it('should allow layers at the top level of the page', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', null), makeRectangle('b', null)])).toBe(true);
  });

  it('should not allow a layer inside a frame, group or section', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', null), makeRectangle('b', 'parent')])).toBe(false);
  });

  it('should not allow a selected section', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', null), section])).toBe(false);
  });

  it('should not allow an empty selection or a missing node', () => {
    // action / result
    expect(canWrapInSection([])).toBe(false);
    expect(canWrapInSection([undefined as unknown as TSceneNode])).toBe(false);
  });
});
