// utils
import { armLineEndpointOnPointerDown } from '../armLineEndpointOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getLineEndpointAtPoint', () => ({
  getLineEndpointAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armLineEndpointDrag', () => ({ armLineEndpointDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = (shiftKey: boolean): Record<string, unknown> => ({
  canvas: 'canvas',
  event: { shiftKey },
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  selectionRefs: { endpointDragRef: 'ref' },
  viewport: 'viewport',
});

describe('armLineEndpointOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
  });

  it('should arm dragging the hit line endpoint', () => {
    // mock
    hitMock.mockReturnValue({ endpoint: 'start', nodeId: 'line' });
    const ctx = context(false);

    // before
    const result = armLineEndpointOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(hitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node'], 'viewport');
    expect(armMock).toHaveBeenCalledWith('canvas', ctx.event, 'ref', 'line', 'start');
  });

  it('should leave the pointer alone without an endpoint hit or with Shift held', () => {
    // mock
    hitMock.mockReturnValueOnce(null).mockReturnValueOnce({ endpoint: 'end', nodeId: 'line' });

    // result
    expect(armLineEndpointOnPointerDown(context(false) as never)).toBeUndefined();
    expect(armLineEndpointOnPointerDown(context(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
