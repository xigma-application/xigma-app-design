// types
import { NodeType, StrokeAlign, StrokeSides } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getStrokedRotatedNodeBounds } from '../getStrokedRotatedNodeBounds';
import { getStrokedSelectionBounds } from '../getStrokedSelectionBounds';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 50,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

const outsideStroke = {
  strokeAlign: StrokeAlign.outside,
  strokeWidth: 8,
  strokes: [{ color: '#000', opacity: 100, type: 'solid' as const }],
};

describe('getStrokedRotatedNodeBounds', () => {
  it('should return the plain bounds without a stroke', () => {
    expect(getStrokedRotatedNodeBounds(buildFrame())).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should include an outside stroke', () => {
    expect(getStrokedRotatedNodeBounds(buildFrame(outsideStroke))).toEqual({ height: 66, width: 116, x: 2, y: 12 });
  });

  it('should include the stroke of every node in a selection', () => {
    const bounds = getStrokedSelectionBounds([buildFrame(outsideStroke), buildFrame({ id: 'frame-2', x: 200, y: 20 })]);

    expect(bounds).toEqual({ height: 66, width: 298, x: 2, y: 12 });
  });
});

describe('getStrokedRotatedNodeBounds with a single stroked side', () => {
  it('should only grow the side that has an outside stroke', () => {
    const frame = buildFrame({
      strokeAlign: StrokeAlign.outside,
      strokeSides: StrokeSides.top,
      strokeWidth: 8,
      strokes: outsideStroke.strokes,
    });

    expect(getStrokedRotatedNodeBounds(frame)).toEqual({ height: 58, width: 100, x: 10, y: 12 });
  });

  it('should take a line from its drawn stroke, and from its box when it has no length', () => {
    // mock
    const line: TLineNode = {
      height: 0,
      id: 'line-1',
      name: 'Line',
      parentId: null,
      rotation: 0,
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 10,
      strokes: [],
      type: NodeType.line,
      width: 100,
      x: 0,
      y: 50,
    };

    // result
    expect(getStrokedRotatedNodeBounds(line)).toEqual({ height: 10, width: 100, x: 0, y: 40 });
    expect(getStrokedRotatedNodeBounds({ ...line, width: 0 })).toEqual({ height: 0, width: 0, x: 0, y: 50 });
  });

  it('should rotate the stroked box of a turned frame', () => {
    // before
    const bounds = getStrokedRotatedNodeBounds(buildFrame({ rotation: 90 }));

    // result
    expect(bounds.width).toBeCloseTo(50, 5);
    expect(bounds.height).toBeCloseTo(100, 5);
  });

  it('should take a vector from its own rotated bounds', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s: { endId: 'b', id: 's', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 20, y: 10 } },
    };

    // result
    expect(getStrokedRotatedNodeBounds(vector)).toEqual({ height: 10, width: 20, x: 0, y: 0 });
  });
});
