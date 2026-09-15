// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGradientAddStopPositionAtPoint } from '../getGradientAddStopPositionAtPoint';
import { getGradientEllipsePositionAtPoint } from '../getGradientEllipsePositionAtPoint';
import { getGradientLinePositionAtPoint } from '../getGradientLinePositionAtPoint';

vi.mock('../getGradientEllipsePositionAtPoint', () => ({ getGradientEllipsePositionAtPoint: vi.fn() }));
vi.mock('../getGradientLinePositionAtPoint', () => ({ getGradientLinePositionAtPoint: vi.fn() }));

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
const POINT = { x: 50, y: 50 };

describe('getGradientAddStopPositionAtPoint', () => {
  beforeEach(() => {
    vi.mocked(getGradientEllipsePositionAtPoint).mockReset().mockReturnValue(null);
    vi.mocked(getGradientLinePositionAtPoint).mockReset().mockReturnValue(null);
  });

  it('should delegate to the line resolver for a linear gradient', () => {
    // before
    getGradientAddStopPositionAtPoint(POINT, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    // result
    expect(getGradientLinePositionAtPoint).toHaveBeenCalledWith(POINT, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);
    expect(getGradientEllipsePositionAtPoint).not.toHaveBeenCalled();
  });

  it('should delegate to the ellipse resolver for an angular gradient', () => {
    // mock
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-angular' } as TRectangleNode['fills'][0]] });

    // before
    getGradientAddStopPositionAtPoint(POINT, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    // result
    expect(getGradientEllipsePositionAtPoint).toHaveBeenCalledWith(POINT, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);
    expect(getGradientLinePositionAtPoint).not.toHaveBeenCalled();
  });

  it('should delegate to the line resolver for a radial gradient, same as linear', () => {
    // mock
    const node = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-radial' } as TRectangleNode['fills'][0]] });

    // before
    getGradientAddStopPositionAtPoint(POINT, [node], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    // result
    expect(getGradientLinePositionAtPoint).toHaveBeenCalled();
    expect(getGradientEllipsePositionAtPoint).not.toHaveBeenCalled();
  });

  it('should delegate to the line resolver when there is no active gradient editor', () => {
    // before
    getGradientAddStopPositionAtPoint(POINT, [rectangle()], IDENTITY_VIEWPORT, null);

    // result
    expect(getGradientLinePositionAtPoint).toHaveBeenCalledWith(POINT, [rectangle()], IDENTITY_VIEWPORT, null);
  });

  it('should delegate to the line resolver for a multi-node selection, even with an angular gradient', () => {
    // mock
    const angularNode = rectangle({ fills: [{ ...rectangle().fills[0], type: 'gradient-angular' } as TRectangleNode['fills'][0]] });

    // before
    getGradientAddStopPositionAtPoint(POINT, [angularNode, rectangle({ id: 'rect-2' })], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    // result
    expect(getGradientLinePositionAtPoint).toHaveBeenCalled();
    expect(getGradientEllipsePositionAtPoint).not.toHaveBeenCalled();
  });

  it('should return whatever the delegated resolver returns', () => {
    // mock
    const hit = { nodeId: 'rect-1', paintIndex: 0, position: 0.5 };

    vi.mocked(getGradientLinePositionAtPoint).mockReturnValue(hit);

    // before
    const result = getGradientAddStopPositionAtPoint(POINT, [rectangle()], IDENTITY_VIEWPORT, GRADIENT_EDITOR);

    // result
    expect(result).toBe(hit);
  });
});
