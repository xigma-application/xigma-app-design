// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { canConvertToSection } from '../canConvertToSection';

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
const makeFrame = (id: string, parentId: string | null): TFrameNode => ({
  ...box,
  childIds: [],
  clipContent: true,
  fills: [],
  id,
  name: id,
  parentId,
  type: NodeType.frame,
});
const section: TSectionNode = {
  ...box,
  childIds: [],
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  id: 'section',
  name: 'Section',
  parentId: null,
  type: NodeType.section,
};
const outer = makeFrame('outer', null);
const nodes: Record<string, TSceneNode> = { outer, section };

describe('canConvertToSection', () => {
  it('should allow frames on the page or directly in a section', () => {
    // action / result
    expect(canConvertToSection([makeFrame('a', null), makeFrame('b', 'section')], nodes)).toBe(true);
  });

  it('should not allow a frame inside a frame', () => {
    // action / result
    expect(canConvertToSection([makeFrame('a', null), makeFrame('b', 'outer')], nodes)).toBe(false);
  });

  it('should not allow an empty selection or a missing node', () => {
    // action / result
    expect(canConvertToSection([], nodes)).toBe(false);
    expect(canConvertToSection([undefined], nodes)).toBe(false);
  });
});
