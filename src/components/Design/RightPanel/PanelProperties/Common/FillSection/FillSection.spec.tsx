import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FillSection from './FillSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const renderFillSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FillSection />
      </TooltipProvider>
    </Provider>,
  );

describe('FillSection behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the Fill label and the apply-styles button in the header', () => {
    // before
    renderFillSection();

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply styles and variables' })).toBeInTheDocument();
  });

  it('should render one row per fill on the selected node', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // result
    expect(screen.getByDisplayValue('111111')).toBeInTheDocument();
    expect(screen.getByDisplayValue('222222')).toBeInTheDocument();
  });

  it('should add a new solid fill when the add button is clicked', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Add fill' }));

    // result
    expect(read(id).fills).toHaveLength(2);
  });

  it('should allow removing every fill, leaving the node with none', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Delete fill' }));

    // result
    expect(read(id).fills).toEqual([]);
  });

  it('should highlight a row as selected once clicked', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    const { container } = renderFillSection();

    // action
    fireEvent.click(container.querySelectorAll('[class*="FillRow_"]')[1]);

    // result
    expect(container.querySelectorAll('[class*="FillRow--selected"]')).toHaveLength(1);
  });

  it('should clear the row selection when clicking outside the fill rows', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    const { container } = renderFillSection();

    // action
    fireEvent.click(container.querySelectorAll('[class*="FillRow_"]')[0]);

    expect(container.querySelectorAll('[class*="FillRow--selected"]')).toHaveLength(1);

    fireEvent.mouseDown(document.body);

    // result
    expect(container.querySelectorAll('[class*="FillRow--selected"]')).toHaveLength(0);
  });

  it('should show a drop indicator while a row is being dragged past another', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    const { container } = renderFillSection();

    // action
    fireEvent.pointerDown(screen.getAllByRole('button', { name: 'Reorder fill' })[0]);
    fireEvent.pointerMove(window, { clientY: 9999 });

    // result
    expect(container.querySelector('[class*="FillDropIndicator_"]')).toBeInTheDocument();

    // cleanup
    fireEvent.pointerUp(window);
  });

  it('should render no rows when the node has no fills', () => {
    const id = addRectangle({ fills: [] });

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // result
    expect(screen.queryByRole('button', { name: 'Delete fill' })).not.toBeInTheDocument();
  });

  it('should drop the section’s bottom padding once it has no fills left', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    // before
    const { container } = renderFillSection();

    expect(container.querySelector('[class*="Section--empty"]')).toBeNull();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Delete fill' }));

    // result
    expect(container.querySelector('[class*="Section--empty"]')).not.toBeNull();
  });
});
