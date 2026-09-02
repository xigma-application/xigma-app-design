import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LeftPanel from './LeftPanel';
import { TooltipProvider } from 'shared';

// others
import { LEFT_PANEL_MAX_WIDTH, LEFT_PANEL_MIN_WIDTH } from './constants';

// store
import { toggleUiHidden, toggleUiMinimized } from 'store/design/slice';
import { store } from 'store';

// types
import { NavItemName } from './NavRail/types';

const renderLeftPanel = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <LeftPanel />
      </TooltipProvider>
    </Provider>,
  );

describe('LeftPanel snapshots', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should render LeftPanel', () => {
    // before
    const { asFragment } = renderLeftPanel();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LeftPanel behaviors', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should own the active nav item state and reflect a click back onto NavRail', () => {
    // before
    renderLeftPanel();

    // action
    fireEvent.click(screen.getByRole('radio', { name: NavItemName.variables }));

    // result
    expect(screen.getByRole('radio', { name: NavItemName.variables })).toBeChecked();
    expect(screen.getByRole('radio', { name: NavItemName.file })).not.toBeChecked();
  });

  it('should render at its default (max) width', () => {
    // before
    const { container } = renderLeftPanel();

    // result
    expect((container.firstChild as HTMLElement).style.width).toBe(`${LEFT_PANEL_MAX_WIDTH}px`);
  });

  it('should shrink when the resize handle is dragged left, since the panel is left-anchored', () => {
    // before
    const { container } = renderLeftPanel();
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
    const { container } = renderLeftPanel();
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
    const { container } = renderLeftPanel();
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

  it('should render the floating minimized toolbar instead of the full panel when the UI is minimized', () => {
    // before
    store.dispatch(toggleUiMinimized());
    renderLeftPanel();

    // result
    expect(screen.getByRole('button', { name: 'xigma' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: NavItemName.file })).not.toBeInTheDocument();
  });

  it('should render nothing when the UI is hidden', () => {
    // before
    store.dispatch(toggleUiHidden());
    const { container } = renderLeftPanel();

    // result
    expect(container.firstChild).toBeNull();

    // cleanup
    store.dispatch(toggleUiHidden());
  });

  it('should keep the same file name across expand/minimize', () => {
    // before
    renderLeftPanel();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    const field = screen.getByRole('textbox', { name: 'Rename file' });
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);
    act(() => {
      store.dispatch(toggleUiMinimized());
    });

    // result
    expect(screen.getByRole('button', { name: 'Screenshots' })).toBeInTheDocument();
  });
});
