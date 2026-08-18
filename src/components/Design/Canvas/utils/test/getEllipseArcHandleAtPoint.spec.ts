// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { getEllipseArcHandleAtPoint } from '../getEllipseArcHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rectangle: TRectangleNode = {
  fill: '#ff0000',
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('getEllipseArcHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getEllipseArcHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // result
    expect(getEllipseArcHandleAtPoint({ x: 100, y: 50 }, [ellipse(), ellipse({ id: 'ellipse-2' })], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the selected node is not an ellipse', () => {
    // result
    expect(getEllipseArcHandleAtPoint({ x: 100, y: 50 }, [rectangle], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null once the shape renders too small on screen', () => {
    // result — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    expect(getEllipseArcHandleAtPoint({ x: 100, y: 50 }, [ellipse()], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });

  it('should detect the handle at the default arcEndAngle (90°, east rim)', () => {
    // result — center (50, 50), radius 50
    expect(getEllipseArcHandleAtPoint({ x: 100, y: 50 }, [ellipse()], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'ellipse-1',
      rotation: 0,
    });
  });

  it('should return null far away from the handle', () => {
    // result
    expect(getEllipseArcHandleAtPoint({ x: 0, y: 0 }, [ellipse()], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should move to the ring band midpoint once arcRatio is above 0', () => {
    // mock — radiusRatio = (0.5 + 1) / 2 = 0.75, so the handle sits at 37.5 from center (87.5, 50)
    const node = ellipse({ arcRatio: 0.5 });

    // result
    expect(getEllipseArcHandleAtPoint({ x: 100, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getEllipseArcHandleAtPoint({ x: 87.5, y: 50 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should detect the handle at its physically flipped position when flipX is set', () => {
    // mock — the default handle (100, 50) mirrors across the center (50, 50) to (0, 50)
    const node = ellipse({ flipX: true });

    // result
    expect(getEllipseArcHandleAtPoint({ x: 0, y: 50 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ flipX: true });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — RADIUS_HANDLE_HIT_RADIUS_PX is 5; 8 world units off the handle misses at zoom 1
    const node = ellipse({ height: 400, width: 400 });

    // result
    expect(getEllipseArcHandleAtPoint({ x: 408, y: 200 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getEllipseArcHandleAtPoint({ x: 408, y: 200 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({ nodeId: 'ellipse-1' });
  });
});
