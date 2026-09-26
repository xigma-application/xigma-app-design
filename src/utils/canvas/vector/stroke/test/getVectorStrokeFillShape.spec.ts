// types
import { StrokeAlign } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { getVectorStrokeFillShape } from '../getVectorStrokeFillShape';
import { makeNetworkVector, makeSquareVector } from './fixtures';

const gradient: TPaint = {
  end: { x: 1, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('getVectorStrokeFillShape', () => {
  it('should leave a plain centred solid stroke to the fast stroke path', () => {
    // result
    expect(getVectorStrokeFillShape(makeSquareVector())).toBeNull();
  });

  it('should outline a plain centred stroke as polygons when it has a gradient', () => {
    // mock
    const vector = makeSquareVector({ strokes: [gradient] });

    // before
    const shape = getVectorStrokeFillShape(vector);

    // result
    expect(shape).toHaveLength(1);
    expect(shape?.[0].polygons.length).toBeGreaterThan(0);
    expect(getVectorStrokeFillShape(vector)).toBe(shape);
  });

  it('should outline an open path with a gradient stroke', () => {
    // mock
    const line = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 } }, [['a', 'b']], { strokes: [gradient] });

    // result
    expect(getVectorStrokeFillShape(line)?.[0].fillRule).toBe('nonZero');
  });

  it('should keep the aligned stroke shape, and draw nothing for a gradient on a zero-width stroke or a vector without paths', () => {
    // result
    expect(getVectorStrokeFillShape(makeSquareVector({ strokeAlign: StrokeAlign.inside }))).not.toBeNull();
    expect(getVectorStrokeFillShape(makeSquareVector({ strokeWidth: 0, strokes: [gradient] }))).toBeNull();
    expect(getVectorStrokeFillShape(makeSquareVector({ segments: {}, strokes: [gradient], vertices: {} }))).toBeNull();
  });
});
