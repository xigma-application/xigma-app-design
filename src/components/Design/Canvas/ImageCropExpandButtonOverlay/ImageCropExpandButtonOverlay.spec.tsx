import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCropExpandButtonOverlay from './ImageCropExpandButtonOverlay';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderImageCropExpandButtonOverlay = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <ImageCropExpandButtonOverlay />
    </Provider>,
  );

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ImageCropExpandButtonOverlay', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should render nothing while crop mode is not active', () => {
    const { container } = renderImageCropExpandButtonOverlay();

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the button inset from the frame edges near its bottom-right corner once crop mode is active', () => {
    const id = addRectangle();

    act(() => store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 })));

    renderImageCropExpandButtonOverlay();

    const button = screen.getByRole('button', { name: 'Expand' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ left: '183px', top: '83px' });
  });
});
