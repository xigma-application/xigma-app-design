// utils
import { hitsMultiSelectBox } from '../hitsMultiSelectBox';

const eligibleMock = vi.fn();
const boxMock = vi.fn();
const onBoxMock = vi.fn();

vi.mock('../../../../../../../utils/getVectorMultiSelectVertexIds', () => ({ getVectorMultiSelectVertexIds: (): string[] => ['a', 'b'] }));
vi.mock('../../../../../../../utils/isVectorMultiSelectBoxEligible', () => ({
  isVectorMultiSelectBoxEligible: (...args: unknown[]): unknown => eligibleMock(...args),
}));
vi.mock('../../../../../../../utils/getVectorMultiSelectBox', () => ({
  getVectorMultiSelectBox: (...args: unknown[]): unknown => boxMock(...args),
}));
vi.mock('../../../../../../../utils/isPointOnVectorMultiSelectBox', () => ({
  isPointOnVectorMultiSelectBox: (...args: unknown[]): unknown => onBoxMock(...args),
}));

const context = {
  canvasRefs: {
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: ['a'] },
    },
    vectorMultiSelect: { vectorMultiSelectBoxRef: 'boxRef' },
  },
  point: { x: 1, y: 2 },
  viewport: 'viewport',
};

describe('hitsMultiSelectBox', () => {
  beforeEach(() => {
    eligibleMock.mockReturnValue(true);
    boxMock.mockReturnValue({ bounds: 'bounds', rotation: 30 });
  });

  it('should be true when the pointer is on the multi-select box of the selected vertices', () => {
    // mock
    onBoxMock.mockReturnValue(true);

    // result
    expect(hitsMultiSelectBox(context as never, ['v'])).toBe(true);
    expect(eligibleMock).toHaveBeenCalledWith(['a', 'b'], ['h']);
    expect(onBoxMock).toHaveBeenCalledWith({ x: 1, y: 2 }, 'bounds', 'viewport', 30);
  });

  it('should be false off the box, without a box, or when the selection has no box', () => {
    // mock
    onBoxMock.mockReturnValue(false);

    // result
    expect(hitsMultiSelectBox(context as never, ['v'])).toBe(false);
    boxMock.mockReturnValue(null);
    expect(hitsMultiSelectBox(context as never, ['v'])).toBe(false);
    eligibleMock.mockReturnValue(false);
    expect(hitsMultiSelectBox(context as never, ['v'])).toBe(false);
  });
});
