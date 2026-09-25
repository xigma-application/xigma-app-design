// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionNameLabelRects } from '../getSectionNameLabelRects';
import { isPointOnNodeNameLabel } from '../isPointOnNodeNameLabel';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 300,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 1000,
  y: 1000,
};

const section: TSectionNode = {
  childIds: ['child'],
  fills: [],
  height: 300,
  id: 'section-1',
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 300,
  x: 2000,
  y: 2000,
};

describe('isPointOnNodeNameLabel', () => {
  it('should hit-test a frame against its frame name label', () => {
    // result
    expect(isPointOnNodeNameLabel({ x: 1006, y: 990 }, frame, 1)).toBe(true);
    expect(isPointOnNodeNameLabel({ x: 1150, y: 1150 }, frame, 1)).toBe(false);
  });

  it('should hit-test a section against its section name badge', () => {
    // mock
    const [labelRect] = getSectionNameLabelRects([section], 1);

    // result
    expect(isPointOnNodeNameLabel({ x: labelRect.x + labelRect.width / 2, y: labelRect.y + labelRect.height / 2 }, section, 1)).toBe(true);
    expect(isPointOnNodeNameLabel({ x: 2150, y: 2150 }, section, 1)).toBe(false);
  });

  it('should be false for a section without a name and for any other layer', () => {
    // mock
    const rectangle = { ...frame, fills: [], type: NodeType.rectangle } as unknown as TRectangleNode;

    // result
    expect(isPointOnNodeNameLabel({ x: 2005, y: 1990 }, { ...section, name: '' }, 1)).toBe(false);
    expect(isPointOnNodeNameLabel({ x: 1006, y: 990 }, rectangle, 1)).toBe(false);
  });
});
