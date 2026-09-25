// types
import { TDrawSceneContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSmartSelectionSuggestion } from '../drawSmartSelectionSuggestion';

const iconMock = vi.fn();
const suggestionMock = vi.fn();

vi.mock('../drawSmartSelectionSuggestionIcon', () => ({
  drawSmartSelectionSuggestionIcon: (...args: unknown[]): unknown => iconMock(...args),
}));
vi.mock('../../../../../../utils/getSmartSelectionSuggestion', () => ({
  getSmartSelectionSuggestion: (...args: unknown[]): unknown => suggestionMock(...args),
}));
vi.mock('../../../../../../utils/getSmartSelectionSuggestionIconRect', () => ({
  getSmartSelectionSuggestionIconRect: (): string => 'icon-rect',
}));
vi.mock('../getSmartSelectionSuggestionKind', () => ({ getSmartSelectionSuggestionKind: (): string => 'row' }));

const context = { buffer: 'b', canvasHeight: 100, canvasWidth: 200, gl: 'gl', program: 'p', viewport: 'v' } as unknown as TDrawSceneContext;
const selected = [{ id: 'a' }] as TSceneNode[];

describe('drawSmartSelectionSuggestion', () => {
  beforeEach(() => {
    iconMock.mockClear();
  });

  it('should draw the icon of the suggested arrangement', () => {
    // mock
    suggestionMock.mockReturnValue({ type: 'append' });

    // before
    drawSmartSelectionSuggestion(context, selected, {});

    // result
    expect(suggestionMock).toHaveBeenCalledWith(selected, 'v', {});
    expect(iconMock).toHaveBeenCalledWith('gl', 'p', 'b', 'icon-rect', 'row', 200, 100, 'v');
  });

  it('should draw nothing without a suggestion', () => {
    // mock
    suggestionMock.mockReturnValue(null);

    // before
    drawSmartSelectionSuggestion(context, selected, {});

    // result
    expect(iconMock).not.toHaveBeenCalled();
  });
});
