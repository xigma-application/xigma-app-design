// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientStopHandleAtPoint } from '../getGradientStopHandleAtPoint';

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

// stop 0 world position: (0, 50) offset up by 22 world units -> (0, 28); stop 1 -> (100, 28)

describe('getGradientStopHandleAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientStopHandleAtPoint({ x: 0, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientStopHandleAtPoint({ x: 0, y: 28 }, [rectangle(), rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR),
    ).toBeNull();
  });

  it('should return null when the gradient editor targets a different node', () => {
    expect(
      getGradientStopHandleAtPoint({ x: 0, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, { ...GRADIENT_EDITOR, nodeId: 'other' }),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not a linear gradient', () => {
    const node = rectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });

    expect(getGradientStopHandleAtPoint({ x: 0, y: 28 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when the point is far from every stop', () => {
    expect(getGradientStopHandleAtPoint({ x: 50, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should hit the first stop', () => {
    const hit = getGradientStopHandleAtPoint({ x: 0, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ nodeId: 'rect-1', paintIndex: 0, stopIndex: 0 });
  });

  it('should hit the second stop', () => {
    const hit = getGradientStopHandleAtPoint({ x: 100, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ nodeId: 'rect-1', paintIndex: 0, stopIndex: 1 });
  });

  it('should shrink the hit tolerance as zoom increases', () => {
    // at zoom 2, the stop's own offset also halves (22/2 = 11), landing it at (0, 39); tolerance halves too (12/2 = 6)
    const zoomedViewport = { x: 0, y: 0, zoom: 2 };

    expect(getGradientStopHandleAtPoint({ x: 5, y: 39 }, [rectangle()], zoomedViewport, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientStopHandleAtPoint({ x: 7, y: 39 }, [rectangle()], zoomedViewport, GRADIENT_EDITOR)).toBeNull();
  });
});
