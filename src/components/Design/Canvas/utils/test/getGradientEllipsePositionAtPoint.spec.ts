// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientEllipsePositionAtPoint } from '../getGradientEllipsePositionAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [
    {
      end: { x: 0.5, y: 1 },
      opacity: 100,
      start: { x: 0.5, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-angular',
    },
  ],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const GRADIENT_EDITOR = { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null };

// center (50,50), primary axis endpoint straight down at (50,100), radius 50 (a perfect circle here
// since the node is square and radiusRatio is 1). Position 0.125 (a 45deg angle, away from every
// handle point) sits on the circle at roughly (14.64, 85.36) — used throughout so hits never
// accidentally collide with the center/endpoint/radius-handle's own move/rotate hit zones.

describe('getGradientEllipsePositionAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientEllipsePositionAtPoint({ x: 14.64, y: 85.36 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientEllipsePositionAtPoint(
        { x: 14.64, y: 85.36 },
        [rectangle(), rectangle({ id: 'rect-2' })],
        IDENTITY_VIEWPORT,
        GRADIENT_EDITOR,
      ),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not angular', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });

    expect(getGradientEllipsePositionAtPoint({ x: 14.64, y: 85.36 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return the angle-based position when the point sits on the ellipse', () => {
    const hit = getGradientEllipsePositionAtPoint({ x: 14.64, y: 85.36 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit?.nodeId).toBe('rect-1');
    expect(hit?.paintIndex).toBe(0);
    expect(hit?.position).toBeCloseTo(0.125, 2);
  });

  it('should return null when the point is too far from the ellipse', () => {
    // same 45deg angle, but at radius 30 instead of the ellipse's own radius 50 — 20 world units off
    expect(getGradientEllipsePositionAtPoint({ x: 28.79, y: 71.21 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when the point is over the center endpoint instead — moving takes priority', () => {
    expect(getGradientEllipsePositionAtPoint({ x: 50, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when the point is over the primary axis endpoint instead — moving takes priority', () => {
    expect(getGradientEllipsePositionAtPoint({ x: 50, y: 100 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when the point is over the radius handle instead — reshaping takes priority', () => {
    expect(getGradientEllipsePositionAtPoint({ x: 0, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should shrink the hit tolerance as zoom increases', () => {
    // same 45deg angle, at radius 56 instead of 50 — 6 world units off, within the 8px tolerance at
    // zoom 1 but not within the 2px tolerance at zoom 4
    const point = { x: 10.4, y: 89.6 };

    expect(getGradientEllipsePositionAtPoint(point, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientEllipsePositionAtPoint(point, [rectangle()], { x: 0, y: 0, zoom: 4 }, GRADIENT_EDITOR)).toBeNull();
  });
});
