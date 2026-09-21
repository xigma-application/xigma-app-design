// types
import { NodeType } from 'types/design/enums';
import { TAppearanceNode } from '../../../AppearanceSection/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSelectionColorOccurrenceEntries } from '../getSelectionColorOccurrenceEntries';

const RECTANGLE_BASE: Omit<TRectangleNode, 'fills'> = {
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

describe('getSelectionColorOccurrenceEntries', () => {
  it('should collect a solid fill entry with its node id, property and index', () => {
    // mock
    const node: TAppearanceNode = { ...RECTANGLE_BASE, fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] };

    // result
    expect(getSelectionColorOccurrenceEntries([node])).toEqual([
      { occurrence: { index: 0, nodeId: 'rect-1', property: 'fills' }, paint: node.fills[0] },
    ]);
  });

  it('should collect fills and strokes across several nodes, in order', () => {
    // mock
    const first: TAppearanceNode = {
      ...RECTANGLE_BASE,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      id: 'rect-1',
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const second: TAppearanceNode = { ...RECTANGLE_BASE, fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }], id: 'rect-2' };

    // result
    expect(getSelectionColorOccurrenceEntries([first, second])).toEqual([
      { occurrence: { index: 0, nodeId: 'rect-1', property: 'fills' }, paint: first.fills[0] },
      { occurrence: { index: 0, nodeId: 'rect-1', property: 'strokes' }, paint: first.strokes![0] },
      { occurrence: { index: 0, nodeId: 'rect-2', property: 'fills' }, paint: second.fills[0] },
    ]);
  });

  it('should skip a fill marked not visible', () => {
    // mock
    const node: TAppearanceNode = { ...RECTANGLE_BASE, fills: [{ color: '#ff0000', opacity: 100, type: 'solid', visible: false }] };

    // result
    expect(getSelectionColorOccurrenceEntries([node])).toEqual([]);
  });

  it('should skip an image fill', () => {
    // mock
    const node: TAppearanceNode = {
      ...RECTANGLE_BASE,
      fills: [{ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
    };

    // result
    expect(getSelectionColorOccurrenceEntries([node])).toEqual([]);
  });

  it('should return no entries for a node with no fills or strokes', () => {
    // mock
    const node: TAppearanceNode = { ...RECTANGLE_BASE, fills: [] };

    // result
    expect(getSelectionColorOccurrenceEntries([node])).toEqual([]);
  });
});
