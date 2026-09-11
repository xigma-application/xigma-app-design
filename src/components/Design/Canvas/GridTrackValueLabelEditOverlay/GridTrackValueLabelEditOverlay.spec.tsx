import { render, screen } from '@testing-library/react';

// components
import GridTrackValueLabelEditOverlay from './GridTrackValueLabelEditOverlay';

const useGridTrackValueLabelEditorMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('./hooks/useGridTrackValueLabelEditor/useGridTrackValueLabelEditor', () => ({
  useGridTrackValueLabelEditor: (): unknown => useGridTrackValueLabelEditorMock(),
}));

const IDLE = { cancel: vi.fn(), commit: vi.fn(), edit: null, liveChange: vi.fn(), viewport: { x: 0, y: 0, zoom: 1 } };

describe('GridTrackValueLabelEditOverlay', () => {
  it('should render nothing while no track value is being edited', () => {
    // mock
    useGridTrackValueLabelEditorMock.mockReturnValue(IDLE);

    // before
    const { container } = render(<GridTrackValueLabelEditOverlay />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should anchor the value input on the edit target’s screen centre, scaled by the viewport zoom', () => {
    // mock — badge 22 x 24 world units centred at (50, -34); viewport pans +100/+200 at 2x zoom
    useGridTrackValueLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { axis: 'column', badgeHeight: 24, badgeWidth: 22, center: { x: 50, y: -34 }, frameId: 'frame-1', index: 0, value: '1fr' },
      viewport: { x: 100, y: 200, zoom: 2 },
    });

    // before
    render(<GridTrackValueLabelEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — screen centre (50*2+100, -34*2+200) = (200, 132); floor 44 x fixed 48
    expect(input).toHaveValue('1fr');
    expect(input).toHaveStyle({ height: '48px', left: '200px', minWidth: '44px', top: '132px' });
  });

  it('should apply the blue-border grid track class, distinct from the shared input’s own default styling', () => {
    // mock
    useGridTrackValueLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { axis: 'column', badgeHeight: 24, badgeWidth: 22, center: { x: 0, y: 0 }, frameId: 'frame-1', index: 0, value: '1fr' },
    });

    // before
    render(<GridTrackValueLabelEditOverlay />);

    // result
    expect(screen.getByRole('textbox').className).toMatch(/GridTrackValueLabelEditOverlay__input/);
  });

  it('should hand its commit, cancel and liveChange callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();
    const liveChange = vi.fn();

    useGridTrackValueLabelEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { axis: 'column', badgeHeight: 24, badgeWidth: 22, center: { x: 0, y: 0 }, frameId: 'frame-1', index: 0, value: '1fr' },
      liveChange,
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<GridTrackValueLabelEditOverlay />);
    await userEvent.clear(screen.getByRole('textbox'));
    liveChange.mockClear();
    await userEvent.type(screen.getByRole('textbox'), '3fr{Enter}');

    // result
    expect(liveChange).toHaveBeenCalled();
    expect(commit).toHaveBeenCalledWith('3fr');
  });
});
