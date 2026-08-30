import { render, screen } from '@testing-library/react';

// components
import FrameNameLabelEditOverlay from './FrameNameLabelEditOverlay';

const useFrameNameLabelEditorMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('./hooks/useFrameNameLabelEditor', () => ({
  useFrameNameLabelEditor: (): unknown => useFrameNameLabelEditorMock(),
}));

const IDLE = { cancel: vi.fn(), commit: vi.fn(), edit: null, viewport: { x: 0, y: 0, zoom: 1 } };

describe('FrameNameLabelEditOverlay', () => {
  it('should render nothing while no label is being edited', () => {
    // mock
    useFrameNameLabelEditorMock.mockReturnValue(IDLE);

    // before
    const { container } = render(<FrameNameLabelEditOverlay />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should anchor the name input on the label’s screen centre, scaled by the viewport zoom', () => {
    // mock — label box 60 x 24 world units centred at (100, -20); viewport pans +100/+200 at 2x zoom
    useFrameNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { center: { x: 100, y: -20 }, height: 24, nodeId: 'frame-1', value: 'Frame 1', width: 60 },
      viewport: { x: 100, y: 200, zoom: 2 },
    });

    // before
    render(<FrameNameLabelEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — screen centre (100*2+100, -20*2+200) = (300, 160); floor 120 x 48
    expect(input).toHaveValue('Frame 1');
    expect(input).toHaveStyle({ height: '48px', left: '300px', minWidth: '120px', top: '160px' });
  });

  it('should hand its commit and cancel callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();

    useFrameNameLabelEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { center: { x: 0, y: 0 }, height: 24, nodeId: 'frame-1', value: 'Frame 1', width: 60 },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<FrameNameLabelEditOverlay />);
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Header{Enter}');

    // result
    expect(commit).toHaveBeenCalledWith('Header');
  });
});
