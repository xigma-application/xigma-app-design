// utils
import { hitsCurrentVectorSelection } from '../hitsCurrentVectorSelection';

const vertexMock = vi.fn();
const handleMock = vi.fn();
const segmentMock = vi.fn();
const boxMock = vi.fn();

vi.mock('../hitsSelectedVertex', () => ({ hitsSelectedVertex: (...args: unknown[]): unknown => vertexMock(...args) }));
vi.mock('../hitsSelectedHandle', () => ({ hitsSelectedHandle: (...args: unknown[]): unknown => handleMock(...args) }));
vi.mock('../hitsSelectedSegment', () => ({ hitsSelectedSegment: (...args: unknown[]): unknown => segmentMock(...args) }));
vi.mock('../hitsMultiSelectBox', () => ({ hitsMultiSelectBox: (...args: unknown[]): unknown => boxMock(...args) }));

describe('hitsCurrentVectorSelection', () => {
  beforeEach(() => {
    [vertexMock, handleMock, segmentMock, boxMock].forEach((mock) => mock.mockReset().mockReturnValue(false));
  });

  it('should be true when the pointer hits any part of the current selection', () => {
    // mock
    boxMock.mockReturnValue(true);

    // result
    expect(hitsCurrentVectorSelection({} as never, ['v'])).toBe(true);
    expect(vertexMock).toHaveBeenCalledWith({}, ['v']);
  });

  it('should stop at the first hit', () => {
    // mock
    vertexMock.mockReturnValue(true);

    // result
    expect(hitsCurrentVectorSelection({} as never, ['v'])).toBe(true);
    expect(handleMock).not.toHaveBeenCalled();
  });

  it('should be false when nothing selected is hit', () => {
    // result
    expect(hitsCurrentVectorSelection({} as never, ['v'])).toBe(false);
  });
});
