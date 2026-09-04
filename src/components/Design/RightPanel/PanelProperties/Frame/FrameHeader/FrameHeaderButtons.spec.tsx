import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderFrameHeaderButtons = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FrameHeaderButtons />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('FrameHeaderButtons snapshots', () => {
  it('should render the html tag, component, and mask buttons', () => {
    // before
    const { asFragment } = renderFrameHeaderButtons();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeaderButtons behaviors', () => {
  it('should do nothing yet when the html tag button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Toggle ready for dev status');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should do nothing yet when the component button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Create component');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should turn the selected frame into a mask when the mask button is clicked', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderButtons();

    // action
    fireEvent.click(screen.getByLabelText('Use as mask'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId].isMask).toBe(true);

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should keep the masked frame selected so the panel does not disappear', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderButtons();

    // action
    fireEvent.click(screen.getByLabelText('Use as mask'));

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([frameId]);

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should render the mask button as active when the selected frame is already a mask', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { isMask: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.getByLabelText('Use as mask')).toHaveAttribute('aria-pressed', 'true');

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should hide the html tag button when the selected frame is already a mask', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { isMask: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.queryByLabelText('Toggle ready for dev status')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should remove the mask, without grouping, when the mask button is clicked while already masked', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(updateNode({ changes: { isMask: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderButtons();

    // action
    fireEvent.click(screen.getByLabelText('Use as mask'));

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[frameId].isMask).toBe(false);
    expect(page.selectedIds).toEqual([frameId]);

    // cleanup
    store.dispatch(setSelection([]));
  });
});
