import { render, screen } from '@testing-library/react';

// others
import { SECTION_NAME_LABEL_CORNER_RADIUS_PX, SECTION_NAME_LABEL_PADDING_X_PX, SECTION_NAME_LABEL_PADDING_Y_PX } from 'constant/canvas';

// components
import SectionNameLabelEditOverlay from './SectionNameLabelEditOverlay';

const useSectionNameLabelEditorMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('./hooks/useSectionNameLabelEditor', () => ({
  useSectionNameLabelEditor: (): unknown => useSectionNameLabelEditorMock(),
}));

const IDLE = { cancel: vi.fn(), commit: vi.fn(), edit: null, viewport: { x: 0, y: 0, zoom: 1 } };

describe('SectionNameLabelEditOverlay', () => {
  it('should render nothing while no label is being edited', () => {
    // mock
    useSectionNameLabelEditorMock.mockReturnValue(IDLE);

    // before
    const { container } = render(<SectionNameLabelEditOverlay />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should anchor its left edge on the label’s exact screen left, and vertically centre on the badge’s screen centre, scaled by the viewport zoom', () => {
    // mock — left edge at world x=20, vertical centre at world y=-34; viewport pans +100/+200 at 2x zoom
    useSectionNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { centerY: -34, height: 24, left: 20, nodeId: 'section-1', value: 'Section 1' },
      viewport: { x: 100, y: 200, zoom: 2 },
    });

    // before
    render(<SectionNameLabelEditOverlay />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — left (20*2+100)=140, nudged 1px by the input's own border; top/centreY (-34*2+200)=132
    expect(input).toHaveValue('Section 1');
    expect(input).toHaveStyle({ height: '48px', left: '139px', top: '132px' });
  });

  it('should style the input in the same dark colors as the badge, not the frame’s light-blue edit style', () => {
    // mock
    useSectionNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { centerY: 0, height: 24, left: 0, nodeId: 'section-1', value: 'Section 1' },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    render(<SectionNameLabelEditOverlay />);

    // result — no border color distinct from the background, matching the badge's borderless look;
    // radius/padding reference the shared constants directly rather than hardcoded numbers, since
    // those are actively tuned design values
    expect(screen.getByRole('textbox')).toHaveStyle({
      backgroundColor: 'rgb(38, 38, 38)',
      borderColor: 'rgb(38, 38, 38)',
      borderRadius: `${SECTION_NAME_LABEL_CORNER_RADIUS_PX}px`,
      color: 'rgb(255, 255, 255)',
      padding: `${SECTION_NAME_LABEL_PADDING_Y_PX}px ${SECTION_NAME_LABEL_PADDING_X_PX}px`,
    });
  });

  it('should never rotate the input — sections can’t be rotated', () => {
    // mock
    useSectionNameLabelEditorMock.mockReturnValue({
      ...IDLE,
      edit: { centerY: 0, height: 24, left: 0, nodeId: 'section-1', value: 'Section 1' },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    render(<SectionNameLabelEditOverlay />);

    // result
    expect(screen.getByRole('textbox')).toHaveStyle({ transform: 'translate(0, -50%) rotate(0deg)' });
  });

  it('should hand its commit and cancel callbacks straight to the input', async () => {
    // mock
    const commit = vi.fn();
    const cancel = vi.fn();

    useSectionNameLabelEditorMock.mockReturnValue({
      cancel,
      commit,
      edit: { centerY: 0, height: 24, left: 0, nodeId: 'section-1', value: 'Section 1' },
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    // before
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<SectionNameLabelEditOverlay />);
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Header{Enter}');

    // result
    expect(commit).toHaveBeenCalledWith('Header');
  });
});
