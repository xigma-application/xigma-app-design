import { fireEvent, render } from '@testing-library/react';
import { FC } from 'react';
import { Provider } from 'react-redux';

// components
import RightPanel from './RightPanel';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// others
import { RIGHT_PANEL_DEFAULT_WIDTH, RIGHT_PANEL_MAX_WIDTH, RIGHT_PANEL_MIN_WIDTH } from './constants';

// store
import { addNode, setSelection, toggleRulers, toggleUiHidden, toggleUiMinimized } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

let capturedRightPanelWidthRef: { current: number } | null = null;

const RefsProbe: FC = () => {
  capturedRightPanelWidthRef = useCanvasRefsContext().layout.rightPanelWidthRef;

  return null;
};

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const renderRightPanel = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <CanvasRefsProvider>
          <RightPanel />
          <RefsProbe />
        </CanvasRefsProvider>
      </TooltipProvider>
    </Provider>,
  );

describe('RightPanel snapshots', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should render RightPanel', () => {
    // before
    const { asFragment } = renderRightPanel();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('RightPanel behaviors', () => {
  beforeEach(() => {
    if (store.getState().design.isUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should render at its default width', () => {
    // before
    const { container } = renderRightPanel();

    // result
    expect((container.firstChild as HTMLElement).style.width).toBe(`${RIGHT_PANEL_DEFAULT_WIDTH}px`);
  });

  it('should grow when the resize handle is dragged left, since the panel is right-anchored', () => {
    // before
    const { container } = renderRightPanel();
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
    const { container } = renderRightPanel();
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
    const { container } = renderRightPanel();
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

  it('should render the compact MinimizedHeader instead of the full panel while the UI is minimized', () => {
    // before
    store.dispatch(toggleUiMinimized());
    const { container } = renderRightPanel();

    // result
    expect(container.querySelector('[class*="RightPanel"]')).toBeNull();
    expect(container.querySelector('[class*="MinimizedHeader"]')).not.toBeNull();
  });

  it('should render the full floating panel instead of MinimizedHeader while minimized with a selection', () => {
    // before
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([rectangleId]));
    store.dispatch(toggleUiMinimized());
    const { container } = renderRightPanel();

    // result
    expect(container.querySelector('[class*="MinimizedHeader"]')).toBeNull();
    expect(container.querySelector('[class*="RightPanel--floating"]')).not.toBeNull();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should add the RightPanel--withRulers modifier while minimized, selected, and rulers are visible', () => {
    // before
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([rectangleId]));
    store.dispatch(toggleUiMinimized());
    store.dispatch(toggleRulers());
    const { container } = renderRightPanel();

    // result
    expect(container.querySelector('[class*="RightPanel--withRulers"]')).not.toBeNull();

    // cleanup
    store.dispatch(toggleRulers());
    store.dispatch(setSelection([]));
  });

  it('should render nothing while the UI is hidden', () => {
    // before
    store.dispatch(toggleUiHidden());
    const { container } = renderRightPanel();

    // result
    expect(container.firstChild).toBeNull();

    // cleanup
    store.dispatch(toggleUiHidden());
  });

  it('should report its rendered width into layout.rightPanelWidthRef, for RulersLayer to stay flush against it', () => {
    // before
    renderRightPanel();

    // result
    expect(capturedRightPanelWidthRef?.current).toBe(RIGHT_PANEL_DEFAULT_WIDTH);
  });

  it('should report 0 while the UI is hidden, since the panel takes up no space', () => {
    // before
    store.dispatch(toggleUiHidden());
    renderRightPanel();

    // result
    expect(capturedRightPanelWidthRef?.current).toBe(0);

    // cleanup
    store.dispatch(toggleUiHidden());
  });

  it('should report 0 while minimized', () => {
    // before
    store.dispatch(toggleUiMinimized());
    renderRightPanel();

    // result
    expect(capturedRightPanelWidthRef?.current).toBe(0);
  });
});
