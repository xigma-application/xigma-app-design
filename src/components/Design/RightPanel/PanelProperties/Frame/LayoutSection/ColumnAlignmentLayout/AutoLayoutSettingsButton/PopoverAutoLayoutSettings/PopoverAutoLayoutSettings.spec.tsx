import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PopoverAutoLayoutSettings from './PopoverAutoLayoutSettings';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

afterEach(() => {
  store.dispatch(setSelection([]));
});

const selectAFrame = (layoutMode: LayoutMode): void => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));
};

const renderSettings = (onClose: TFunc = vi.fn(), layoutMode: LayoutMode = LayoutMode.horizontal): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PopoverAutoLayoutSettings layoutMode={layoutMode} onClose={onClose} />
      </TooltipProvider>
    </Provider>,
  );

describe('PopoverAutoLayoutSettings snapshots', () => {
  it('should render the full panel', () => {
    // before
    const { asFragment } = renderSettings();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PopoverAutoLayoutSettings behaviors', () => {
  it('should render every row label', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByText('Inside stroke')).toBeInTheDocument();
    expect(screen.getByText('Canvas stacking')).toBeInTheDocument();
    expect(screen.getByText('Align text baseline')).toBeInTheDocument();
    expect(screen.getByText('Auto spacing')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should show the default dropdown values from the mockup', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText('Last on top')).toBeInTheDocument();
    expect(screen.getByText('Between')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });

  it('should call onClose when the header close button is clicked', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderSettings(onClose);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show the inside stroke preview visual while hovering the row, and restore the placeholder on leave', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.mouseEnter(screen.getByText('Inside stroke').parentElement!);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    // action
    fireEvent.mouseLeave(screen.getByText('Inside stroke').parentElement!);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should preview the hovered dropdown option, like x-design does, while the dropdown is open', () => {
    // before
    const { container } = renderSettings();

    // action — open the dropdown and hover the non-selected option
    fireEvent.click(screen.getByText('Included'));
    fireEvent.mouseEnter(screen.getByText('Excluded'));

    // result
    expect(container.querySelector('[class*="PreviewInsideStroke--excluded"]')).not.toBeNull();
  });

  it('should show the canvas stacking preview visual while hovering the row, and restore the placeholder on leave', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.mouseEnter(screen.getByText('Canvas stacking').parentElement!);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    // action
    fireEvent.mouseLeave(screen.getByText('Canvas stacking').parentElement!);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should preview the hovered canvas stacking dropdown option, like x-design does, while the dropdown is open', () => {
    // before
    const { container } = renderSettings();

    // action — open the dropdown and hover the non-selected option
    fireEvent.click(screen.getByText('Last on top'));
    fireEvent.mouseEnter(screen.getByText('First on top'));

    // result
    expect(container.querySelector('[class*="PreviewCanvasStacking--first-on-top"]')).not.toBeNull();
  });

  it('should show the align text baseline preview visual while hovering the row, and restore the placeholder on leave', () => {
    // before
    const { container } = renderSettings();

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.mouseEnter(screen.getByText('Align text baseline').parentElement!);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewAlignTextBaseline"]')).not.toBeNull();

    // action
    fireEvent.mouseLeave(screen.getByText('Align text baseline').parentElement!);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should select the "off" align-text-baseline toggle button by default', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByLabelText('Off')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should switch align text baseline to on when clicked', () => {
    // before
    selectAFrame(LayoutMode.horizontal);
    renderSettings();

    // action
    fireEvent.click(screen.getByLabelText('On'));

    // result
    expect(screen.getByLabelText('On')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should preview the hovered align text baseline toggle option, like x-design does', () => {
    // before
    const { container } = renderSettings();

    // action
    fireEvent.mouseEnter(screen.getByLabelText('On'));

    // result
    expect(container.querySelector('[class*="PreviewAlignTextBaseline--on"]')).not.toBeNull();
  });

  it('should show the auto spacing preview visual while hovering the row, and restore the placeholder on leave', () => {
    // before
    const { container } = renderSettings();

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.mouseEnter(screen.getByText('Auto spacing').parentElement!);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewAutoSpacing"]')).not.toBeNull();

    // action
    fireEvent.mouseLeave(screen.getByText('Auto spacing').parentElement!);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should disable the auto spacing dropdown trigger', () => {
    // before
    renderSettings();

    // result
    expect(screen.getByText('Between').closest('button')).toBeDisabled();
  });

  it('should not render the auto spacing disabled tooltip content until hovered', () => {
    // before
    renderSettings();

    // result
    expect(screen.queryByText('Only applicable for Auto gap')).not.toBeInTheDocument();
  });

  it('should show the layout preview visual while hovering the row, and restore the placeholder on leave', () => {
    // before
    const { container } = renderSettings();

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.mouseEnter(screen.getByText('Layout').parentElement!);

    // result
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="PreviewLayout"]')).not.toBeNull();

    // action
    fireEvent.mouseLeave(screen.getByText('Layout').parentElement!);

    // result
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should preview the hovered layout dropdown option, like x-design does, while the dropdown is open', () => {
    // before
    const { container } = renderSettings();

    // action — open the dropdown and hover the non-selected option
    fireEvent.click(screen.getByText('Updated'));
    fireEvent.mouseEnter(screen.getByText('Legacy'));

    // result
    expect(container.querySelector('[class*="PreviewLayout--legacy"]')).not.toBeNull();
  });

  it('should only show the inside stroke and layout rows for a grid layout', () => {
    // before
    renderSettings(vi.fn(), LayoutMode.grid);

    // result
    expect(screen.getByText('Inside stroke')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.queryByText('Canvas stacking')).not.toBeInTheDocument();
    expect(screen.queryByText('Align text baseline')).not.toBeInTheDocument();
    expect(screen.queryByText('Auto spacing')).not.toBeInTheDocument();
  });

  it('should hide the align text baseline row for a non-horizontal layout, since it only applies to horizontal auto layout', () => {
    // before
    renderSettings(vi.fn(), LayoutMode.vertical);

    // result — every other row still shows for a vertical frame
    expect(screen.getByText('Inside stroke')).toBeInTheDocument();
    expect(screen.getByText('Canvas stacking')).toBeInTheDocument();
    expect(screen.getByText('Auto spacing')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.queryByText('Align text baseline')).not.toBeInTheDocument();
  });
});
