// utils
import { armSmartSelectionSuggestionOnPointerDown } from '../armSmartSelectionSuggestionOnPointerDown';

const getSmartSelectionSuggestionIconAtPointMock = vi.fn();
const applySmartSelectionSuggestionMock = vi.fn();

vi.mock('../../../../../../utils/getSmartSelectionSuggestionIconAtPoint', () => ({
  getSmartSelectionSuggestionIconAtPoint: (...args: unknown[]): unknown => getSmartSelectionSuggestionIconAtPointMock(...args),
}));
vi.mock('../../applySmartSelectionSuggestion', () => ({
  applySmartSelectionSuggestion: (...args: unknown[]): void => applySmartSelectionSuggestionMock(...args),
}));

const dispatch = vi.fn();
const point = { x: 10, y: 20 };
const selectedNodes = [] as never[];
const viewport = { x: 0, y: 0, zoom: 1 };

describe('armSmartSelectionSuggestionOnPointerDown', () => {
  beforeEach(() => {
    getSmartSelectionSuggestionIconAtPointMock.mockReset();
    applySmartSelectionSuggestionMock.mockClear();
  });

  it('should apply the suggestion and return true when the icon is hit', () => {
    // mock
    const suggestion = { axis: 'x', gapValues: [40, 90], layout: { gaps: [], nodes: [], type: 'row' }, type: 'equalize' };

    getSmartSelectionSuggestionIconAtPointMock.mockReturnValue({ rect: { height: 24, width: 24, x: 0, y: 0 }, suggestion });

    // before
    const result = armSmartSelectionSuggestionOnPointerDown({ dispatch, point, selectedNodes, viewport } as never);

    // result
    expect(result).toBe(true);
    expect(applySmartSelectionSuggestionMock).toHaveBeenCalledWith(dispatch, suggestion);
  });

  it('should return undefined and apply nothing when the icon is missed', () => {
    // mock
    getSmartSelectionSuggestionIconAtPointMock.mockReturnValue(null);

    // before
    const result = armSmartSelectionSuggestionOnPointerDown({ dispatch, point, selectedNodes, viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(applySmartSelectionSuggestionMock).not.toHaveBeenCalled();
  });
});
