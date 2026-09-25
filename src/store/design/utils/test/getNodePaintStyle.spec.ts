// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { getNodePaintStyle } from '../getNodePaintStyle';

describe('getNodePaintStyle', () => {
  it('should read the fills, strokes and stroke settings of a section', () => {
    // mock
    const section: TSectionNode = {
      childIds: [],
      fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
      height: 10,
      id: 'section-1',
      name: 'Section',
      parentId: null,
      rotation: 0,
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes: [{ color: '#FFFFFF', opacity: 10, type: 'solid' }],
      type: NodeType.section,
      width: 10,
      x: 0,
      y: 0,
    };

    // result
    expect(getNodePaintStyle(section)).toEqual({
      effects: undefined,
      fills: section.fills,
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes: section.strokes,
    });
  });
});
