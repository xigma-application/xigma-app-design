// types
import { NodeType, StrokeJoin, StrokeMode } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineOffsetVector } from '../getLineOffsetVector';

const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: 'frame',
  rotation: 0,
  strokeWidth: 3,
  strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

const getBounds = (vector: ReturnType<typeof getLineOffsetVector>): number[] => {
  const points = Object.values(vector.vertices);

  return [
    Math.min(...points.map((point) => point.x)),
    Math.min(...points.map((point) => point.y)),
    Math.max(...points.map((point) => point.x)),
    Math.max(...points.map((point) => point.y)),
  ];
};

describe('getLineOffsetVector', () => {
  it('should draw a sharp rectangle the offset away from the line on every side, stroked like the line and unfilled', () => {
    // before
    const vector = getLineOffsetVector(line, 20, StrokeJoin.miter);

    // result
    expect(getBounds(vector)).toEqual([-20, -20, 120, 20]);
    expect(Object.keys(vector.segments)).toHaveLength(4);
    expect(vector).toMatchObject({ defaultFill: null, filledFaceKeys: [], parentId: 'frame', strokeColor: '#ff0000', strokeWidth: 3 });
  });

  it('should round the ends off into a capsule for a round join', () => {
    // before
    const vector = getLineOffsetVector(line, 20, StrokeJoin.round);

    // result
    expect(Object.values(vector.segments).some((segment) => segment.tangentStart !== null)).toBe(true);
  });

  it('should fall back to a black stroke for a line without a solid stroke', () => {
    // result
    expect(getLineOffsetVector({ ...line, strokes: [] }, 10, StrokeJoin.miter).strokeColor).toBe('#000000');
  });

  it('should keep the line stroke mode and its settings on the vector', () => {
    // before
    const vector = getLineOffsetVector({ ...line, strokeDynamicWiggle: 40, strokeMode: StrokeMode.dynamic }, 10, StrokeJoin.miter);

    // result
    expect(vector).toMatchObject({ strokeDynamicWiggle: 40, strokeMode: StrokeMode.dynamic });
  });
});
