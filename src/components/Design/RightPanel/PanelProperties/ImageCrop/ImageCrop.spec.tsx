import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCrop from './ImageCrop';
import { TooltipProvider } from 'shared';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

const renderImageCrop = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageCrop />
      </TooltipProvider>
    </Provider>,
  );

const addImageCropRectNode = (): string => {
  const paint: TImagePaint = {
    crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
    opacity: 100,
    ref: 'image-1',
    rotation: 0,
    scaleMode: 'fill',
    type: 'image',
  };

  store.dispatch(
    addNode({
      fills: [paint],
      height: 40,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const nodeId = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([nodeId]));
  store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'image' }));

  return nodeId;
};

describe('ImageCrop', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should compose the header, position and dimensions sections together', () => {
    // mock
    addImageCropRectNode();

    // before
    renderImageCrop();

    // result
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getAllByText('Position')).toHaveLength(2);
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toHaveValue(20);
    expect(screen.getByLabelText('Height')).toHaveValue(20);
  });
});
