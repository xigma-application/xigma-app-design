import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import StrokeSection from './StrokeSection';
import { TooltipProvider } from 'shared';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

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
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const readNode = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const renderStrokeSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={createCanvasRefs()}>
        <TooltipProvider>
          <StrokeSection />
        </TooltipProvider>
      </CanvasRefsContext.Provider>
    </Provider>,
  );

describe('StrokeSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should label the section "Stroke" and start empty and muted', () => {
    // before
    addRectangle();
    const { container } = renderStrokeSection();

    // result
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(container.querySelector('[class*="Section--muted"]')).not.toBeNull();
  });

  it('should show the stroke settings row only once a stroke exists', () => {
    // before
    addRectangle();
    renderStrokeSection();

    // result
    expect(screen.queryByText('Position')).toBeNull();

    // action
    fireEvent.click(screen.getByLabelText('Add stroke'));

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });

  it('should add a solid stroke paint with a default 1px width, leaving the fills untouched', () => {
    // before
    const id = addRectangle();
    renderStrokeSection();

    // action
    fireEvent.click(screen.getByLabelText('Add stroke'));

    // result
    expect(readNode(id).strokes).toHaveLength(1);
    expect(readNode(id).strokes?.[0]).toMatchObject({ color: '#000000', type: 'solid' });
    expect(readNode(id).strokeWidth).toBe(1);
    expect(readNode(id).strokeAlign).toBe('inside');
    expect(readNode(id).fills).toHaveLength(1);
  });

  it('should keep an existing stroke width when adding another stroke', () => {
    // before
    const id = addRectangle({ strokeWidth: 4, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] });
    renderStrokeSection();

    // action
    fireEvent.click(screen.getByLabelText('Add stroke'));

    // result
    expect(readNode(id).strokes).toHaveLength(2);
    expect(readNode(id).strokeWidth).toBe(4);
  });

  it('should remove a stroke with its minus button without touching the fills', () => {
    // before
    const id = addRectangle({ strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] });
    renderStrokeSection();

    // action
    fireEvent.click(screen.getByLabelText('Delete stroke'));

    // result
    expect(readNode(id).strokes).toEqual([]);
    expect(readNode(id).fills).toHaveLength(1);
  });
});
