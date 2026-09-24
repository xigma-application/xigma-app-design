import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FillSection from './FillSection';
import { TooltipProvider } from 'shared';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

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
      <CanvasRefsContext.Provider value={createCanvasRefs()}>
        <TooltipProvider>
          <FillSection />
        </TooltipProvider>
      </CanvasRefsContext.Provider>
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

  it('should commit a hex change onto the correct fill by index, leaving the others untouched', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // action — edit the second row's hex field
    fireEvent.blur(screen.getByDisplayValue('222222'), { target: { value: '333333' } });

    // result
    expect(read(id).fills).toEqual([
      { color: '#111111', opacity: 100, type: 'solid' },
      { color: '#333333', opacity: 100, type: 'solid' },
    ]);
  });

  it('should toggle visibility on the correct fill by index, leaving the others untouched', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    // before
    renderFillSection();

    // action — toggle the second row's visibility
    fireEvent.click(screen.getAllByRole('button', { name: 'Hide fill' })[1]);

    // result
    expect(read(id).fills).toEqual([
      { color: '#111111', opacity: 100, type: 'solid' },
      { color: '#222222', opacity: 100, type: 'solid', visible: false },
    ]);
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

  it('should show the shared fills of several nodes and write an edit to every one of them in one undo step', () => {
    // mock
    const fills: TRectangleNode['fills'] = [{ color: '#111111', opacity: 100, type: 'solid' }];
    const firstId = addRectangle({ fills });
    const secondId = addRectangle({ fills });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    renderFillSection();

    // action
    fireEvent.blur(screen.getByDisplayValue('111111'), { target: { value: '333333' } });

    // result
    expect([read(firstId).fills[0], read(secondId).fills[0]]).toEqual([
      { color: '#333333', opacity: 100, type: 'solid' },
      { color: '#333333', opacity: 100, type: 'solid' },
    ]);

    store.dispatch(undo());

    expect([read(firstId).fills[0], read(secondId).fills[0]]).toEqual([fills[0], fills[0]]);
  });

  it('should show the mixed content hint when the fill count differs, and replace every fill with one new fill on add', () => {
    // mock
    const firstId = addRectangle();
    const secondId = addRectangle({
      fills: [
        { color: '#ff0000', opacity: 100, type: 'solid' },
        { color: '#00ff00', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    renderFillSection();

    // result
    expect(screen.getByText('Click + to replace mixed content')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('FF0000')).not.toBeInTheDocument();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Add fill' }));

    // result
    expect(read(firstId).fills).toHaveLength(1);
    expect(read(secondId).fills).toEqual(read(firstId).fills);
  });

  it('should treat fills with the same count but different settings as mixed', () => {
    // mock
    const firstId = addRectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });
    const secondId = addRectangle({ fills: [{ color: '#ff0000', opacity: 50, type: 'solid' }] });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    renderFillSection();

    // result
    expect(screen.getByText('Click + to replace mixed content')).toBeInTheDocument();
  });
});
