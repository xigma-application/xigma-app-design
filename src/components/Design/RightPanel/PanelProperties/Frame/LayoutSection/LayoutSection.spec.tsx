import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LayoutSection from './LayoutSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderLayoutSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <LayoutSection />
      </TooltipProvider>
    </Provider>,
  );

const addAutoLayoutFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      layoutMode: LayoutMode.horizontal,
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

  return rootOrder[rootOrder.length - 1];
};

describe('LayoutSection snapshots', () => {
  it('should render the flow row', () => {
    // before
    const { asFragment } = renderLayoutSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LayoutSection behaviors', () => {
  it('should render the section label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should render the flow row label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Flow')).toBeInTheDocument();
  });

  it('should render the dimensions row label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
  });

  it('should render the clip content checkbox label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Clip content')).toBeInTheDocument();
  });
});

describe('LayoutSection Min/Max reveal flow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should reveal an empty Min width row, writing nothing to the node until a value is typed', () => {
    // mock
    const frameId = addAutoLayoutFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    renderLayoutSection();

    // action — open the width dropdown and add a min bound
    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.click(screen.getByText('Add min width…'));

    // result — the row is visible, but no real minWidth exists on the node yet
    const minWidthInput = screen.getByLabelText('Min width');

    expect(minWidthInput).toHaveValue(null);
    expect(selectActivePage(store.getState()).nodes[frameId]).not.toHaveProperty('minWidth');

    // action — typing and committing a real value
    fireEvent.change(minWidthInput, { target: { value: '40' } });
    fireEvent.blur(minWidthInput);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toHaveProperty('minWidth', 40);
  });

  it('should hide the revealed-but-empty Min width row once a different node is selected', () => {
    // mock
    const frameId = addAutoLayoutFrameNode();
    const otherFrameId = addAutoLayoutFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    renderLayoutSection();

    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.click(screen.getByText('Add min width…'));

    expect(screen.getByLabelText('Min width')).toBeInTheDocument();

    // action — switch selection away and back
    act(() => {
      store.dispatch(setSelection([otherFrameId]));
      store.dispatch(setSelection([frameId]));
    });

    // result — the never-committed row is gone
    expect(screen.queryByLabelText('Min width')).toBeNull();
  });
});
