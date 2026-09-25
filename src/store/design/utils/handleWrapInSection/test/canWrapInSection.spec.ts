// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

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

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
const section: TSectionNode = {
  ...box,
  childIds: [],
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  id: 'section',
  name: 'Section',
  parentId: null,
  type: NodeType.section,
};
const frame: TFrameNode = {
  ...box,
  childIds: [],
  clipContent: true,
  fills: [],
  id: 'frame',
  name: 'Frame',
  parentId: null,
  type: NodeType.frame,
};
const nodes: Record<string, TSceneNode> = { frame, section };

describe('canWrapInSection', () => {
  it('should allow layers and sections at the top level of the page', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', null), section], nodes)).toBe(true);
  });

  it('should allow layers that sit directly in the same section', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', 'section'), makeRectangle('b', 'section')], nodes)).toBe(true);
  });

  it('should not allow layers inside a frame', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', 'frame')], nodes)).toBe(false);
  });

  it('should not allow layers from different parents', () => {
    // action / result
    expect(canWrapInSection([makeRectangle('a', null), makeRectangle('b', 'section')], nodes)).toBe(false);
  });

  it('should not allow an empty selection or a missing node', () => {
    // action / result
    expect(canWrapInSection([], nodes)).toBe(false);
    expect(canWrapInSection([undefined], nodes)).toBe(false);
  });
});
