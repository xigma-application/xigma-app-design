import { fireEvent, render, screen } from '@testing-library/react';

// components
import LeftPanel from './LeftPanel';

// others
import { LEFT_PANEL_MAX_WIDTH, LEFT_PANEL_MIN_WIDTH } from './constants';

// types
import { NavItemName } from './NavRail/types';

describe('LeftPanel snapshots', () => {
  it('should render LeftPanel', () => {
    // before
    const { asFragment } = render(<LeftPanel />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LeftPanel behaviors', () => {
  it('should own the active nav item state and reflect a click back onto NavRail', () => {
    // before
    render(<LeftPanel />);

    // action
    fireEvent.click(screen.getByRole('radio', { name: NavItemName.variables }));

    // result
    expect(screen.getByRole('radio', { name: NavItemName.variables })).toBeChecked();
    expect(screen.getByRole('radio', { name: NavItemName.file })).not.toBeChecked();
  });

  it('should render at its default (max) width', () => {
    // before
    const { container } = render(<LeftPanel />);

    // result
    expect((container.firstChild as HTMLElement).style.width).toBe(`${LEFT_PANEL_MAX_WIDTH}px`);
  });

  it('should shrink when the resize handle is dragged left, since the panel is left-anchored', () => {
    // before
    const { container } = render(<LeftPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 0 } as DOMRect);

    // action — non-inverted panel: dragging left shrinks the width
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 400 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe('400px');
  });

  it('should clamp to the min width when dragged past it', () => {
    // before
    const { container } = render(<LeftPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 0 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 0 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe(`${LEFT_PANEL_MIN_WIDTH}px`);
  });

  it('should clamp to the max width when dragged past it', () => {
    // before
    const { container } = render(<LeftPanel />);
    const panel = container.firstChild as HTMLElement;
    const handle = panel.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 0 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientX: 900 });
    fireEvent.mouseUp(document);

    // result
    expect(panel.style.width).toBe(`${LEFT_PANEL_MAX_WIDTH}px`);
  });
});
