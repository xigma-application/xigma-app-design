// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TRectSegment } from '../../types';

// utils
import { closeRun } from '../closeRun';

const createShape = (id: string): TBatchShape =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TBatchShape;

const createGl = (hasBuffers: boolean): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    STATIC_DRAW: 2,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffers ? {} : null)),
  }) as unknown as WebGL2RenderingContext;

describe('closeRun', () => {
  it('should do nothing for an empty run', () => {
    // mock
    const segments: TRectSegment[] = [];

    // before
    closeRun(createGl(true), segments, [], {});

    // result
    expect(segments).toEqual([]);
  });

  it('should turn a run into a single chunk segment', () => {
    // mock
    const segments: TRectSegment[] = [];

    // before
    closeRun(createGl(true), segments, [createShape('a'), createShape('b')], {});

    // result
    expect(segments).toHaveLength(1);
    expect('chunk' in segments[0] && segments[0].chunk.nodes).toHaveLength(2);
  });

  it('should fall back to one node segment per shape when no buffer can be created', () => {
    // mock
    const segments: TRectSegment[] = [];
    const first = createShape('a');
    const second = createShape('b');

    // before
    closeRun(createGl(false), segments, [first, second], {});

    // result
    expect(segments).toEqual([{ node: first }, { node: second }]);
  });
});
