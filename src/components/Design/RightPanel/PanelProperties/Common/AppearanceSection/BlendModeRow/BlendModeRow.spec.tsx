import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import BlendModeRow from './BlendModeRow';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const renderRow = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <BlendModeRow />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const addAndSelectRectangle = (blendMode?: BlendMode): string => {
  store.dispatch(
    addNode({
      blendMode,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('BlendModeRow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing while the node is on the default Pass through', () => {
    // before
    addAndSelectRectangle();
    const { container } = renderRow();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should show the row with the current mode once a blend mode is set', () => {
    // before
    addAndSelectRectangle(BlendMode.darken);
    renderRow();

    // result
    expect(screen.getByText('Blend mode')).toBeInTheDocument();
    expect(screen.getByText('Darken')).toBeInTheDocument();
  });

  it('should change the blend mode from the dropdown', () => {
    // before
    const id = addAndSelectRectangle(BlendMode.darken);
    renderRow();

    // action
    fireEvent.click(screen.getByText('Darken'));
    fireEvent.click(screen.getByText('Multiply'));

    // result
    expect(read(id).blendMode).toBe(BlendMode.multiply);
  });

  it('should remove the blend mode with the minus button', () => {
    // before
    const id = addAndSelectRectangle(BlendMode.darken);
    renderRow();

    // action
    fireEvent.click(screen.getByLabelText('Remove blend mode'));

    // result
    expect(read(id).blendMode).toBe(BlendMode.passThrough);
  });
});
