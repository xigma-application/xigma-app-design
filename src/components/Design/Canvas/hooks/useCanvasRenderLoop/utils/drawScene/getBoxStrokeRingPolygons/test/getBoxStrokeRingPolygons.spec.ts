// types
import { NodeType, StrokeAlign, StrokeProfile, StrokeSides } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxStrokePolygons } from '../../getBoxStrokePolygons';
import { getBoxStrokeProfilePolygons } from '../../getBoxStrokeProfilePolygons';
import { getBoxStrokeRingPolygons } from '../getBoxStrokeRingPolygons';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  strokeAlign: StrokeAlign.inside,
  strokeWidth: 4,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getBoxStrokeRingPolygons', () => {
  it('should fall back to the uniform polygons when no profile is set', () => {
    // before
    const node = rect();

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside));
  });

  it('should fall back to the uniform polygons for the Uniform profile', () => {
    // before
    const node = rect({ strokeProfile: StrokeProfile.uniform });

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside));
  });

  it('should use the profiled polygons when a non-uniform profile is set on all sides', () => {
    // before
    const node = rect({ strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: true });

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokeProfilePolygons(node));
  });

  it('should default to not flipped when strokeProfileFlipped is unset', () => {
    // before
    const node = rect({ strokeProfile: StrokeProfile.wedge });

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokeProfilePolygons(node));
  });

  it('should fall back to the uniform polygons when the sides are not all', () => {
    // before
    const node = rect({ strokeProfile: StrokeProfile.wedge, strokeSides: StrokeSides.top, strokeTopWidth: 4 });

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokePolygons(node, { bottom: 0, left: 0, right: 0, top: 4 }, StrokeAlign.inside));
  });

  it('should fall back to the uniform polygons when there is no stroke width', () => {
    // before
    const node = rect({ strokeProfile: StrokeProfile.wedge, strokeWidth: 0 });

    // action
    const result = getBoxStrokeRingPolygons(node);

    // result
    expect(result).toEqual(getBoxStrokePolygons(node, { bottom: 0, left: 0, right: 0, top: 0 }, StrokeAlign.inside));
  });
});
