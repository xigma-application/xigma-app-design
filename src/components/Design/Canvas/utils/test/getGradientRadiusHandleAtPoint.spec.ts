// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientRadiusHandleAtPoint } from '../getGradientRadiusHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-radial',
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

// start (0,50), end (100,50) -> the radius handle sits perpendicular to that axis, at world (0, 150)

describe('getGradientRadiusHandleAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientRadiusHandleAtPoint({ x: 0, y: 150 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientRadiusHandleAtPoint({ x: 0, y: 150 }, [rectangle(), rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not a radial gradient', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-linear' } as TRectangleNode['fills'][0]] });

    expect(getGradientRadiusHandleAtPoint({ x: 0, y: 150 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should hit the radius handle within its tolerance', () => {
    expect(getGradientRadiusHandleAtPoint({ x: 0, y: 152 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toEqual({
      nodeId: 'rect-1',
      paintIndex: 0,
    });
  });

  it('should return null past the hit tolerance', () => {
    expect(getGradientRadiusHandleAtPoint({ x: 0, y: 165 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should move with a custom radiusRatio', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], radiusRatio: 0.4 } as TRectangleNode['fills'][0]] });

    expect(getGradientRadiusHandleAtPoint({ x: 0, y: 90 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toEqual({
      nodeId: 'rect-1',
      paintIndex: 0,
    });
  });

  it('should return null when the start endpoint is hit instead — endpoint move takes priority', () => {
    expect(getGradientRadiusHandleAtPoint({ x: 3, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should shrink the hit radius as zoom increases', () => {
    const point = { x: 0, y: 154 };

    expect(getGradientRadiusHandleAtPoint(point, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientRadiusHandleAtPoint(point, [rectangle()], { x: 0, y: 0, zoom: 4 }, GRADIENT_EDITOR)).toBeNull();
  });
});
