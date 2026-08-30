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

  it('should anchor its left edge on the label’s exact screen left, and vertically centre on the hit rect’s screen centre, scaled by the viewport zoom', () => {
    // mock — left edge at world x=20, vertical centre at world y=-34; viewport pans +100/+200 at 2x zoom
    useFrameNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { angleDeg: 0, centerY: -34, height: 24, left: 20, nodeId: 'frame-1', value: 'Frame 1' },
      viewport: { x: 100, y: 200, zoom: 2 },
    });

    // before
    render(<FrameNameLabelEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — left (20*2+100)=140, nudged 1px by the input's own border; top/centreY (-34*2+200)=132
    expect(input).toHaveValue('Frame 1');
    expect(input).toHaveStyle({ height: '48px', left: '139px', top: '132px' });
  });

  it('should pass the anchor’s angle straight through as the input’s rotation', () => {
    // mock
    useFrameNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { angleDeg: 30, centerY: 0, height: 24, left: 0, nodeId: 'frame-1', value: 'Frame 1' },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    render(<FrameNameLabelEditOverlay />);

    // result
    expect(screen.getByRole('textbox')).toHaveStyle({ transform: 'translate(0, -50%) rotate(30deg)' });
  });

  it('should hand its commit and cancel callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();

    useFrameNameLabelEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { angleDeg: 0, centerY: 0, height: 24, left: 0, nodeId: 'frame-1', value: 'Frame 1' },
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
