// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getShapeContactGuides, isContactGuideEligibleNode } from '../getShapeContactGuides';

const rect = (overrides: Partial<Omit<TRectangleNode, 'type'>> & { type?: NodeType } = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id: 'r',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const ACTIVE = { height: 100, width: 100, x: 0, y: 0 };

describe('getShapeContactGuides', () => {
  it('should draw a line on both shapes along the touched right edge — each spanning its own height', () => {
    // before — neighbour sits flush to the active shape's right edge, vertically overlapping
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 60, width: 80, x: 100, y: 20 }, id: 'n' }]);

    // result — active's own right edge (0..100 tall) and the neighbour's left edge (20..80 tall)
    expect(guides).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 20, y2: 80 },
    ]);
  });

  it('should draw a line on both shapes along the touched bottom edge — each spanning its own width', () => {
    // before — neighbour sits flush below, horizontally overlapping
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 30, y: 100 }, id: 'n' }]);

    // result
    expect(guides).toEqual([
      { x1: 0, x2: 100, y1: 100, y2: 100 },
      { x1: 30, x2: 70, y1: 100, y2: 100 },
    ]);
  });

  it('should draw a line on both shapes along the touched left edge', () => {
    // before — neighbour flush to the active shape's left edge
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 60, width: 40, x: -40, y: 20 }, id: 'n' }]);

    // result
    expect(guides).toEqual([
      { x1: 0, x2: 0, y1: 0, y2: 100 },
      { x1: 0, x2: 0, y1: 20, y2: 80 },
    ]);
  });

  it('should draw a line on both shapes along the touched top edge', () => {
    // before — neighbour flush above
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 30, y: -40 }, id: 'n' }]);

    // result
    expect(guides).toEqual([
      { x1: 0, x2: 100, y1: 0, y2: 0 },
      { x1: 30, x2: 70, y1: 0, y2: 0 },
    ]);
  });

  it('should tolerate a sub-pixel gap as contact', () => {
    // before — 0.4px gap, within CONTACT_GUIDE_TOLERANCE_PX
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 30, y: 100.4 }, id: 'n' }]);

    // result
    expect(guides).toHaveLength(2);
  });

  it('should treat a real gap as no contact', () => {
    // before — 2px gap
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 30, y: 102 }, id: 'n' }]);

    // result
    expect(guides).toEqual([]);
  });

  it('should not report contact when the shapes overlap rather than touch edge-to-edge', () => {
    // before — neighbour sits on top of the active shape, no flush edge
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 20, y: 20 }, id: 'n' }]);

    // result
    expect(guides).toEqual([]);
  });

  it('should not report contact for a flush edge with no overlap on the other axis', () => {
    // before — flush to the right edge but entirely below the active shape (corner-kiss only)
    const guides = getShapeContactGuides(ACTIVE, [{ bounds: { height: 40, width: 40, x: 100, y: 100 }, id: 'n' }]);

    // result
    expect(guides).toEqual([]);
  });

  it('should emit a pair of lines per touching neighbour', () => {
    // before — one neighbour flush right, another flush below
    const guides = getShapeContactGuides(ACTIVE, [
      { bounds: { height: 40, width: 40, x: 100, y: 50 }, id: 'right' },
      { bounds: { height: 40, width: 40, x: 50, y: 100 }, id: 'bottom' },
    ]);

    // result
    expect(guides).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 50, y2: 90 },
      { x1: 0, x2: 100, y1: 100, y2: 100 },
      { x1: 50, x2: 90, y1: 100, y2: 100 },
    ]);
  });
});

describe('isContactGuideEligibleNode', () => {
  it('should accept an axis-aligned rectangle', () => {
    expect(isContactGuideEligibleNode(rect())).toBe(true);
  });

  it('should accept a shape rotated by a multiple of 90 degrees', () => {
    expect(isContactGuideEligibleNode(rect({ rotation: 270 }))).toBe(true);
    expect(isContactGuideEligibleNode(rect({ rotation: -90 }))).toBe(true);
  });

  it('should reject a shape rotated off the 90-degree grid', () => {
    expect(isContactGuideEligibleNode(rect({ rotation: 45 }))).toBe(false);
  });

  it('should reject a hidden shape', () => {
    expect(isContactGuideEligibleNode(rect({ hidden: true }))).toBe(false);
  });

  it('should reject group, the one container node type with no fixed footprint', () => {
    expect(isContactGuideEligibleNode(rect({ type: NodeType.group }))).toBe(false);
  });

  it('should accept frame and section, same as any other shape', () => {
    expect(isContactGuideEligibleNode(rect({ type: NodeType.frame }))).toBe(true);
    expect(isContactGuideEligibleNode(rect({ type: NodeType.section }))).toBe(true);
  });

  it('should reject a node without a rotation, such as a line', () => {
    expect(isContactGuideEligibleNode({ id: 'l', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 } as unknown as TSceneNode)).toBe(false);
  });
});
