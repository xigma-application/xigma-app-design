// types
import { LineEndpoint, StrokeDashCap, StrokeMode, StrokeProfile, StrokeStyle } from 'types/design/enums';

// utils
import { getLineFrame } from '../getLineFrame';
import { getLineModeStrokeShape } from '../getLineModeStrokeShape';
import { makeLine } from './fixtures';
import { TLineNode } from 'types/design/types';

const shapeOf = (overrides: Partial<TLineNode>): ReturnType<typeof getLineModeStrokeShape> => {
  const line = makeLine(overrides);

  return getLineModeStrokeShape(line, getLineFrame(line));
};

describe('getLineModeStrokeShape', () => {
  it('should leave a plain uniform stroke to the regular outline', () => {
    // result
    expect(shapeOf({})).toBeNull();
  });

  it('should fill dashes with their arrowheads by the nonzero rule, all wound the same way', () => {
    // before
    const shape = shapeOf({ endPoint: LineEndpoint.lineArrow, strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed });

    // result
    expect(shape?.fillRule).toBe('nonZero');
    expect(shape?.polygons).toHaveLength(6);
  });

  it('should give each dash the chosen dash cap', () => {
    // before
    const shape = shapeOf({ strokeDash: 10, strokeDashCap: StrokeDashCap.round, strokeGap: 10, strokeStyle: StrokeStyle.dashed });

    // result
    expect(shape?.polygons[0]).toHaveLength(18);
  });

  it('should fall back to the regular outline for too many dashes or a dynamic stroke without frequency', () => {
    // result
    expect(shapeOf({ strokeDash: 0.01, strokeGap: 0.01, strokeStyle: StrokeStyle.dashed, width: 100000 })).toBeNull();
    expect(shapeOf({ strokeDynamicFrequency: 0, strokeMode: StrokeMode.dynamic })).toBeNull();
  });

  it('should draw a width profile and a dynamic stroke as one band each', () => {
    // result
    expect(shapeOf({ strokeProfile: StrokeProfile.taper })?.polygons).toHaveLength(1);
    expect(shapeOf({ strokeProfile: StrokeProfile.taper, strokeProfileFlipped: true })?.polygons).toHaveLength(1);
    expect(shapeOf({ strokeMode: StrokeMode.dynamic })?.polygons).toHaveLength(1);
  });

  it('should draw a brush by the even-odd rule without arrowheads, or nothing for an unknown brush', () => {
    // result
    expect(shapeOf({ endPoint: LineEndpoint.lineArrow, strokeMode: StrokeMode.brush })?.fillRule).toBe('evenOdd');
    expect(shapeOf({ strokeBrush: 'missing', strokeMode: StrokeMode.brush })).toBeNull();
  });
});
