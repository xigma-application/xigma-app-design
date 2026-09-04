import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LayoutSectionButtons from './LayoutSectionButtons';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderLayoutSectionButtons = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <LayoutSectionButtons />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 200,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
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
      x: 10,
      y: 10,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('LayoutSectionButtons snapshots', () => {
  it('should render the resize-to-fit and auto-layout buttons', () => {
    // before
    const { asFragment } = renderLayoutSectionButtons();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LayoutSectionButtons behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when the resize-to-fit button is clicked and the selected frame has no children', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderLayoutSectionButtons();
    const before = selectActivePage(store.getState()).nodes[frameId];

    // action
    fireEvent.click(screen.getByLabelText('Resize to fit'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toEqual(before);
  });

  it('should resize the selected frame around its children when the resize-to-fit button is clicked', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId] });
    store.dispatch(setSelection([frameId]));

    // before
    renderLayoutSectionButtons();

    // action
    fireEvent.click(screen.getByLabelText('Resize to fit'));

    // result
    const frame = selectActivePage(store.getState()).nodes[frameId] as TFrameNode;
    expect(frame.x).toBe(10);
    expect(frame.y).toBe(10);
    expect(frame.width).toBe(20);
    expect(frame.height).toBe(20);
  });

  it('should do nothing yet when the auto-layout button is clicked', () => {
    // before
    renderLayoutSectionButtons();
    const button = screen.getByLabelText('Use auto layout');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
