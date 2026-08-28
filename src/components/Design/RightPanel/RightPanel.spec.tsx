import { fireEvent, render } from '@testing-library/react';

// components
import RightPanel from './RightPanel';

// others
import { RIGHT_PANEL_DEFAULT_WIDTH, RIGHT_PANEL_MAX_WIDTH, RIGHT_PANEL_MIN_WIDTH } from './constants';

describe('RightPanel snapshots', () => {
  it('should render RightPanel', () => {
    // before
    const { asFragment } = render(<RightPanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('RightPanel behaviors', () => {
  it('should render at its default width', () => {
    // before
    const { container } = render(<RightPanel />);

    // result
    expect((container.firstChild as HTMLElement).style.width).toBe(`${RIGHT_PANEL_DEFAULT_WIDTH}px`);
  });

  it('should grow when the resize handle is dragged left, since the panel is right-anchored', () => {
    // before
    const { container } = render(<RightPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ right: 1000 } as DOMRect);

    // action — inverted panel: dragging left (away from the right edge) grows the width
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 700 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe('300px');
  });

  it('should clamp to the min width when dragged past it', () => {
    // before
    const { container } = render(<RightPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ right: 1000 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 900 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe(`${RIGHT_PANEL_MIN_WIDTH}px`);
  });

  it('should clamp to the max width when dragged past it', () => {
    // before
    const { container } = render(<RightPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ right: 1000 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 0 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe(`${RIGHT_PANEL_MAX_WIDTH}px`);
  });
});
