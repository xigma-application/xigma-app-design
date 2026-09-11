// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridAxisTrackCount } from '../getGridAxisTrackCount';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getGridAxisTrackCount', () => {
  it('should read the explicit column count', () => {
    expect(getGridAxisTrackCount(frame({ gridColumnCount: 4 }), {}, 'column')).toBe(4);
  });

  it('should default the column count to 1 when absent', () => {
    expect(getGridAxisTrackCount(frame(), {}, 'column')).toBe(1);
  });

  it('should read the explicit row count', () => {
    expect(getGridAxisTrackCount(frame({ gridRowCount: 5 }), {}, 'row')).toBe(5);
  });

  it('should derive the row count from placed children when absent', () => {
    const nodesById = {
      a: {
        fill: '#000',
        height: 10,
        id: 'a',
        name: 'a',
        parentId: 'grid-1',
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      } as never,
    };

    expect(getGridAxisTrackCount(frame({ childIds: ['a'], gridColumnCount: 1 }), nodesById, 'row')).toBe(1);
  });
});
