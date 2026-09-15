// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientRotateHandleAtPoint } from '../getGradientRotateHandleAtPoint';

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
      type: 'gradient-linear',
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

// the line runs world (0,50) -> (100,50): start at (0,50), end at (100,50)

describe('getGradientRotateHandleAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientRotateHandleAtPoint({ x: 0, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientRotateHandleAtPoint({ x: 0, y: 50 }, [rectangle(), rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not a linear gradient', () => {
    const node = rectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });

    expect(getGradientRotateHandleAtPoint({ x: 0, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should hit the start endpoint within the outer rotate ring', () => {
    const hit = getGradientRotateHandleAtPoint({ x: 8, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      endpoint: 'start',
      nodeId: 'rect-1',
      paintIndex: 0,
      rotation: 0,
    });
  });

  it('should hit the end endpoint within the outer rotate ring', () => {
    const hit = getGradientRotateHandleAtPoint({ x: 92, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit?.endpoint).toBe('end');
  });

  it('should return null when the point is nowhere near either endpoint', () => {
    expect(getGradientRotateHandleAtPoint({ x: 50, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null within the inner move radius — moving the point takes priority over rotating it', () => {
    expect(getGradientRotateHandleAtPoint({ x: 5, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when a stop swatch is hit instead — stops take priority', () => {
    // the stop at position 0 sits at world (0, 50), offset up by 18 -> (0, 32), within the stop's own 12px hit radius of (0, 20)
    const hit = getGradientRotateHandleAtPoint({ x: 0, y: 20 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toBeNull();
  });

  it('should shrink the outer hit radius as zoom increases', () => {
    const point = { x: 8, y: 50 };

    expect(getGradientRotateHandleAtPoint(point, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientRotateHandleAtPoint(point, [rectangle()], { x: 0, y: 0, zoom: 4 }, GRADIENT_EDITOR)).toBeNull();
  });

  it('should hit the outer rotate ring around the center point of a radial gradient', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });
    const hit = getGradientRotateHandleAtPoint({ x: 8, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      endpoint: 'start',
      nodeId: 'rect-1',
      paintIndex: 0,
      rotation: 0,
    });
  });

  it('should return null for a radial gradient within the inner move radius of the center — moving takes priority', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });

    expect(getGradientRotateHandleAtPoint({ x: 5, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should also hit the outer rotate ring around the edge point of a radial gradient', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });
    const hit = getGradientRotateHandleAtPoint({ x: 92, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit?.endpoint).toBe('end');
  });
});
