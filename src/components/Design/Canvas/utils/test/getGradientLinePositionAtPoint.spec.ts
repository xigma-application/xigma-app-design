// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientLinePositionAtPoint } from '../getGradientLinePositionAtPoint';

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

// the line runs world (0,50) -> (100,50)

describe('getGradientLinePositionAtPoint', () => {
  it('should return null when there is no active gradient editor', () => {
    expect(getGradientLinePositionAtPoint({ x: 50, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, null)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    expect(
      getGradientLinePositionAtPoint({ x: 50, y: 50 }, [rectangle(), rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR),
    ).toBeNull();
  });

  it('should return null when the gradient editor targets a different node', () => {
    expect(
      getGradientLinePositionAtPoint({ x: 50, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, { ...GRADIENT_EDITOR, nodeId: 'other' }),
    ).toBeNull();
  });

  it('should return null when the targeted paint is not a linear gradient', () => {
    const node = rectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });

    expect(getGradientLinePositionAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return the position when the point sits on the line', () => {
    const hit = getGradientLinePositionAtPoint({ x: 50, y: 50 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ nodeId: 'rect-1', paintIndex: 0, position: 0.5 });
  });

  it('should return null when the point is too far from the line', () => {
    expect(getGradientLinePositionAtPoint({ x: 50, y: 80 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null when the point is over an existing stop instead — stops take priority', () => {
    // the stop at position 0 sits at world (0, 50), offset up by 22 -> (0, 28)
    const hit = getGradientLinePositionAtPoint({ x: 0, y: 28 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toBeNull();
  });

  it('should return null when the point is within the rotate handle radius of an endpoint — rotating takes priority', () => {
    // the line's own endpoint sits at world (0, 50); (0, 43) is 7px away, within both the line's own
    // 8px tolerance and the endpoint's 10px rotate radius — rotate must win the tie
    const hit = getGradientLinePositionAtPoint({ x: 0, y: 43 }, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toBeNull();
  });

  it('should shrink the hit tolerance as zoom increases', () => {
    // 6 world units off the line at zoom 1 (tolerance 8) hits, but at zoom 4 (tolerance 2) it should not
    const point = { x: 50, y: 56 };

    expect(getGradientLinePositionAtPoint(point, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).not.toBeNull();
    expect(getGradientLinePositionAtPoint(point, [rectangle()], { x: 0, y: 0, zoom: 4 }, GRADIENT_EDITOR)).toBeNull();
  });

  it('should also add stops onto the start->end line of a radial gradient', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });
    const hit = getGradientLinePositionAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ nodeId: 'rect-1', paintIndex: 0, position: 0.5 });
  });

  it('should also add stops onto the start->end line of a diamond gradient, same as radial', () => {
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-diamond' } as TRectangleNode['fills'][0]] });
    const hit = getGradientLinePositionAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    expect(hit).toEqual({ nodeId: 'rect-1', paintIndex: 0, position: 0.5 });
  });

  it('should return null for an angular gradient — clicking its line never adds a stop', () => {
    // an angular stop's position is an angle, not a linear lerp along the line, so line-click add-stop
    // does not apply to it
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-angular' } as TRectangleNode['fills'][0]] });

    expect(getGradientLinePositionAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });

  it('should return null on a radial gradient when the point is on its perpendicular radius handle instead', () => {
    // a small radiusRatio (0.05) pulls the radius handle in close to the line, at world (0, 55) —
    // close enough that the line's own hit-test would otherwise match it too, if it didn't bail first
    const node = rectangle({
      fills: [{ ...rectangle().fills[0], radiusRatio: 0.05, type: 'gradient-radial' } as TRectangleNode['fills'][0]],
    });

    expect(getGradientLinePositionAtPoint({ x: 0, y: 55 }, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR)).toBeNull();
  });
});
