// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from '../getGradientEndpointMoveHandleAtPoint';

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

describe('getGradientEndpointMoveHandleAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientEndpointMoveHandleAtPoint({ x: 0, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientEndpointMoveHandleAtPoint({ x: 0, y: 50 }, [rectangle(), rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not a linear gradient', () => {
    const node = rectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });

    expect(getGradientEndpointMoveHandleAtPoint({ x: 0, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should hit the start endpoint within the tight move radius', () => {
    const hit = getGradientEndpointMoveHandleAtPoint({ x: 3, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ endpoint: 'start', nodeId: 'rect-1', paintIndex: 0 });
  });

  it('should hit the end endpoint within the tight move radius', () => {
    const hit = getGradientEndpointMoveHandleAtPoint({ x: 97, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit?.endpoint).toBe('end');
  });

  it('should return null just past the move radius, leaving room for the outer rotate ring', () => {
    expect(getGradientEndpointMoveHandleAtPoint({ x: 8, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when a stop swatch is hit instead — stops take priority', () => {
    // (0, 44) is 6px from the start endpoint (0, 50) — within the move radius — but also exactly
    // 12px from the stop swatch at (0, 32), within the stop's own hit radius; stop wins the tie
    const hit = getGradientEndpointMoveHandleAtPoint({ x: 0, y: 44 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toBeNull();
  });

  it('should shrink the hit radius as zoom increases', () => {
    const point = { x: 4, y: 50 };

    expect(getGradientEndpointMoveHandleAtPoint(point, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientEndpointMoveHandleAtPoint(point, [rectangle()], { x: 0, y: 0, zoom: 4 }, GRADIENT_EDITOR)).toBeNull();
  });

  it('should also hit the start/end move handles of a radial gradient', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });
    const hit = getGradientEndpointMoveHandleAtPoint({ x: 3, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ endpoint: 'start', nodeId: 'rect-1', paintIndex: 0 });
  });
});
