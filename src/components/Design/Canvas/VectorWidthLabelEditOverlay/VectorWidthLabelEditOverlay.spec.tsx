import { render, screen } from '@testing-library/react';

// components
import VectorWidthLabelEditOverlay from './VectorWidthLabelEditOverlay';

const useVectorWidthLabelEditorMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('./hooks/useVectorWidthLabelEditor/useVectorWidthLabelEditor', () => ({
  useVectorWidthLabelEditor: (): unknown => useVectorWidthLabelEditorMock(),
}));

const IDLE = { cancel: vi.fn(), commit: vi.fn(), edit: null, viewport: { x: 0, y: 0, zoom: 1 } };

describe('VectorWidthLabelEditOverlay', () => {
  it('should render nothing while no label is being edited', () => {
    // mock
    useVectorWidthLabelEditorMock.mockReturnValue(IDLE);

    // before
    const { container } = render(<VectorWidthLabelEditOverlay />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should anchor the value input on the label’s screen centre, scaled by the viewport zoom', () => {
    // mock — badge 22 x 24 world units centred at (50, -34); viewport pans +100/+200 at 2x zoom
    useVectorWidthLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { badgeHeight: 24, badgeWidth: 22, center: { x: 50, y: -34 }, nodeId: 'node-1', pointId: 'p1', value: 12 },
      viewport: { x: 100, y: 200, zoom: 2 },
    });

    // before
    render(<VectorWidthLabelEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — screen centre (50*2+100, -34*2+200) = (200, 132); floor 44 x fixed 48
    expect(input).toHaveValue('12');
    expect(input).toHaveStyle({ height: '48px', left: '200px', minWidth: '44px', top: '132px' });
  });

  it('should hand its commit and cancel callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();

    useVectorWidthLabelEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { badgeHeight: 24, badgeWidth: 22, center: { x: 0, y: 0 }, nodeId: 'node-1', pointId: 'p1', value: 12 },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<VectorWidthLabelEditOverlay />);
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), '30{Enter}');

    // result
    expect(commit).toHaveBeenCalledWith('30');
  });
});
