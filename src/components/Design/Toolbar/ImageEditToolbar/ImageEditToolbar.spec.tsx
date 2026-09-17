import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageEditToolbar from './ImageEditToolbar';
import { TooltipProvider } from 'shared';

// store
import { addNode, setImageEditor, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectImageEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const renderImageEditToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageEditToolbar />
      </TooltipProvider>
    </Provider>,
  );

const selectRectangleWithFills = (fills: TPaint[]): string => {
  store.dispatch(
    addNode({ fills, height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const IMAGE_FILL: TPaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('ImageEditToolbar', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setImageEditor(null));
  });

  it('should render nothing when the selected node has no image fill', () => {
    // before
    selectRectangleWithFills([{ color: '#ff0000', opacity: 100, type: 'solid' }]);

    const { container } = renderImageEditToolbar();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render every action once the selection has an image fill', () => {
    // before
    act(() => selectRectangleWithFills([IMAGE_FILL]));

    renderImageEditToolbar();

    // result — every action shows both its icon and a visible text label
    expect(screen.getByRole('button', { name: 'Crop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select area' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove background' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit with prompt' })).toBeInTheDocument();
    expect(screen.getByText('Crop')).toBeInTheDocument();
    expect(screen.getByText('Select area')).toBeInTheDocument();
    expect(screen.getByText('Remove background')).toBeInTheDocument();
    expect(screen.getByText('Edit with prompt')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should enter crop mode on the image fill when Crop is clicked', () => {
    // before
    const id = selectRectangleWithFills([IMAGE_FILL]);

    renderImageEditToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Crop' }));

    // result
    expect(selectImageEditor(store.getState())).toMatchObject({ mode: 'crop', nodeId: id, paintIndex: 0 });
  });

  it('should toggle the Select area button as active on click, with no other effect', () => {
    // before
    act(() => selectRectangleWithFills([IMAGE_FILL]));

    renderImageEditToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select area' }));

    // result
    expect(screen.getByRole('button', { name: 'Select area' })).toHaveAttribute('aria-pressed', 'true');

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Select area' }));

    // result
    expect(screen.getByRole('button', { name: 'Select area' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should open the More dropdown and list Expand, Boost resolution and Vectorize', async () => {
    // mock
    const user = userEvent.setup();

    // before
    act(() => selectRectangleWithFills([IMAGE_FILL]));
    renderImageEditToolbar();

    // action
    await user.click(screen.getByRole('button', { name: 'More' }));

    // result
    expect(screen.getByText('Expand')).toBeInTheDocument();
    expect(screen.getByText('Boost resolution')).toBeInTheDocument();
    expect(screen.getByText('Vectorize')).toBeInTheDocument();
  });

  it('should stay hidden while Vector Edit Mode is active, even with an image fill selected', () => {
    // before
    const id = selectRectangleWithFills([IMAGE_FILL]);
    act(() => store.dispatch(setVectorEditingNodeIds([id])));

    const { container } = renderImageEditToolbar();

    // result
    expect(container).toBeEmptyDOMElement();
  });
});
