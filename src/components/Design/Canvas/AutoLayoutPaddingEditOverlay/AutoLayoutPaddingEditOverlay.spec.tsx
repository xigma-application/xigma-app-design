import { render, screen } from '@testing-library/react';

// components
import AutoLayoutPaddingEditOverlay from './AutoLayoutPaddingEditOverlay';

const useAutoLayoutPaddingEditorMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('./hooks/useAutoLayoutPaddingEditor', () => ({
  useAutoLayoutPaddingEditor: (): unknown => useAutoLayoutPaddingEditorMock(),
}));

const IDLE = { cancel: vi.fn(), commit: vi.fn(), edit: null };

describe('AutoLayoutPaddingEditOverlay', () => {
  it('should render nothing while no padding value is being edited', () => {
    // mock
    useAutoLayoutPaddingEditorMock.mockReturnValue(IDLE);

    // before
    const { container } = render(<AutoLayoutPaddingEditOverlay />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the value input anchored on the edit’s screen position, with the side’s icon and value', () => {
    // mock
    useAutoLayoutPaddingEditorMock.mockReturnValue({
      ...IDLE,
      edit: { centerX: 140, centerY: 132, frameId: 'frame-1', iconName: 'PaddingT', initialValue: 12, side: 'top' },
    });

    // before
    render(<AutoLayoutPaddingEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result
    expect(input).toHaveValue('12');
    expect(input.parentElement).toHaveStyle({ left: '140px', top: '132px' });
  });

  it('should hand its commit and cancel callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();

    useAutoLayoutPaddingEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { centerX: 0, centerY: 0, frameId: 'frame-1', iconName: 'PaddingT', initialValue: 12, side: 'top' },
    });

    // before
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<AutoLayoutPaddingEditOverlay />);
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), '40{Enter}');

    // result
    expect(commit).toHaveBeenCalledWith('40');
    expect(cancel).not.toHaveBeenCalled();
  });
});
