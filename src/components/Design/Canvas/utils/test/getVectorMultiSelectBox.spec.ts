// types
import { TVectorMultiSelectBox } from 'types/design/canvas/types';

// utils
import { getVectorMultiSelectBox } from '../getVectorMultiSelectBox';

const boundsMock = vi.fn();

vi.mock('../getVectorMultiSelectPoints', () => ({ getVectorMultiSelectPoints: (): string => 'points' }));
vi.mock('../getVectorMultiSelectSelectionKey', () => ({
  getVectorMultiSelectSelectionKey: (vertexIds: string[]): string => vertexIds.join(','),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorMultiSelectBounds', () => ({
  getVectorMultiSelectBounds: (...args: unknown[]): unknown => boundsMock(...args),
}));

describe('getVectorMultiSelectBox', () => {
  it('should build and remember an axis-aligned box around the selected points', () => {
    // mock
    const boxRef = { current: null as TVectorMultiSelectBox | null };
    boundsMock.mockReturnValue('bounds');

    // before
    const box = getVectorMultiSelectBox({}, ['v'], ['a', 'b'], [], boxRef);

    // result
    expect(box).toEqual({ bounds: 'bounds', rotation: 0, selectionKey: 'a,b' });
    expect(boxRef.current).toBe(box);
  });

  it('should keep the remembered box while the selection is the same', () => {
    // mock
    const remembered = { bounds: 'rotated', rotation: 30, selectionKey: 'a,b' } as unknown as TVectorMultiSelectBox;
    const boxRef = { current: remembered };

    // result
    expect(getVectorMultiSelectBox({}, ['v'], ['a', 'b'], [], boxRef)).toBe(remembered);
  });

  it('should forget the box when the selection has no bounds', () => {
    // mock
    const boxRef = { current: { selectionKey: 'old' } as TVectorMultiSelectBox | null };
    boundsMock.mockReturnValue(null);

    // result
    expect(getVectorMultiSelectBox({}, ['v'], ['a'], [], boxRef)).toBeNull();
    expect(boxRef.current).toBeNull();
  });
});
