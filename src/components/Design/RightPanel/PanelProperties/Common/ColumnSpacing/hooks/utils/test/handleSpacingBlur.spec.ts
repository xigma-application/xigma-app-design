import { FocusEvent } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { handleSpacingBlur } from '../handleSpacingBlur';

const commitMock = vi.fn();

vi.mock('../commitSelectionSpacing', () => ({ commitSelectionSpacing: (...args: unknown[]): unknown => commitMock(...args) }));

const makeRectangle = (id: string, x: number, y: number, size = 20): TRectangleNode => ({
  fills: [],
  height: size,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleSpacingBlur', () => {
  beforeEach(() => {
    commitMock.mockClear();
  });

  it('should commit a new spacing for the grouped items', () => {
    // mock
    const dispatch = vi.fn();
    const items = [makeRectangle('b', 60, 0), makeRectangle('a', 0, 0)];

    // before
    handleSpacingBlur(dispatch, items, 'horizontal', 40)(blurEvent('12'));

    // result
    expect(commitMock).toHaveBeenCalledWith(dispatch, [['a'], ['b']], 'horizontal', 12);
  });

  it('should restore the shown value for invalid or unchanged input', () => {
    // mock
    const invalid = blurEvent('abc');
    const unchanged = blurEvent('40');

    // before
    handleSpacingBlur(vi.fn(), [], 'vertical', 'Mixed')(invalid);
    handleSpacingBlur(vi.fn(), [], 'vertical', 40)(unchanged);

    // result
    expect(commitMock).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('Mixed');
    expect(unchanged.target.value).toBe('40');
  });
});
