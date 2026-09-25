// others
import { LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { isPointOnPathTextHandle } from '../isPointOnPathTextHandle';

const handleMock = vi.fn();

vi.mock('../getPathTextHandlePoint', () => ({ getPathTextHandlePoint: (...args: unknown[]): unknown => handleMock(...args) }));

const box = {} as TEditingTextBox;

describe('isPointOnPathTextHandle', () => {
  it('should be true within the handle radius, scaled by zoom', () => {
    // mock
    handleMock.mockReturnValue({ x: 0, y: 0 });

    // result
    expect(isPointOnPathTextHandle({ x: LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / 2, y: 0 }, box, { x: 0, y: 0, zoom: 2 })).toBe(true);
    expect(isPointOnPathTextHandle({ x: LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX, y: 0 }, box, { x: 0, y: 0, zoom: 2 })).toBe(false);
  });

  it('should be false without a handle', () => {
    // mock
    handleMock.mockReturnValue(null);

    // result
    expect(isPointOnPathTextHandle({ x: 0, y: 0 }, box, { x: 0, y: 0, zoom: 1 })).toBe(false);
  });
});
