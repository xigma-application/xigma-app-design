// types
import { NodeType, StrokeAlign, StrokeProfile } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';
import { getBoxStrokeProfilePolygons } from '../getBoxStrokeProfilePolygons';

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

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(b.x - a.x, b.y - a.y);

describe('getBoxStrokeProfilePolygons', () => {
  it('should keep the outer polygon identical to the unprofiled uniform-width outline', () => {
    // before
    const node = rect();

    // action
    const [outer] = getBoxStrokeProfilePolygons({ ...node, strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: false });
    const [uniformOuter] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);

    // result
    expect(outer).toEqual(uniformOuter);
  });

  it('should keep the Wedge profile at full width right at the loop start', () => {
    // before
    const node = rect();

    // action
    const [, inner] = getBoxStrokeProfilePolygons({ ...node, strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: false });
    const [, uniformInner] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);

    // result
    expect(inner[0]).toEqual(uniformInner[0]);
  });

  it('should thin the Wedge profile out further around the loop than the uniform width', () => {
    // before
    const node = rect();

    // action
    const [outer, inner] = getBoxStrokeProfilePolygons({ ...node, strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: false });
    const [, uniformInner] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);
    const lastIndex = inner.length - 1;

    // result
    expect(distance(inner[lastIndex], outer[lastIndex])).toBeLessThan(distance(uniformInner[lastIndex], outer[lastIndex]));
  });

  it('should flip which end of the loop is thick', () => {
    // before
    const node = rect();

    // action
    const [outer, inner] = getBoxStrokeProfilePolygons({ ...node, strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: true });
    const [, uniformInner] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);

    // result
    expect(distance(inner[0], outer[0])).toBeLessThan(distance(uniformInner[0], outer[0]));
  });
});
