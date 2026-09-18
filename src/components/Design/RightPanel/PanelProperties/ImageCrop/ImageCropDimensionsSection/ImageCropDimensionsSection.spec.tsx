import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCropDimensionsSection from './ImageCropDimensionsSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

const renderImageCropDimensionsSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageCropDimensionsSection />
      </TooltipProvider>
    </Provider>,
  );

const addImageCropRectNode = (crop: TImagePaint['crop']): string => {
  const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

  store.dispatch(
    addNode({
      fills: [paint],
      height: 300,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 300,
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

describe('ImageCropDimensionsSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should render the Layout section label with the width/height fields', () => {
    // mock
    addImageCropRectNode({ height: 120, rotation: 0, width: 80, x: 0, y: 0 });

    // before
    renderImageCropDimensionsSection();

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toHaveValue(80);
    expect(screen.getByLabelText('Height')).toHaveValue(120);
  });

  it('should hide the aspect-ratio lock button entirely, since it is always locked here and a permanently-disabled toggle serves no purpose', () => {
    // mock
    addImageCropRectNode({ height: 120, rotation: 0, width: 80, x: 0, y: 0 });

    // before
    renderImageCropDimensionsSection();

    // result — neither the locked nor unlocked variant of the button renders at all
    expect(screen.queryByLabelText('Unlock aspect ratio')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Lock aspect ratio')).not.toBeInTheDocument();
  });

  it('should scale the height proportionally when the width is committed, since the lock cannot be turned off', () => {
    // mock
    const nodeId = addImageCropRectNode({ height: 120, rotation: 0, width: 80, x: 0, y: 0 });

    // before
    renderImageCropDimensionsSection();
    const input = screen.getByLabelText('Width');

    // action
    fireEvent.change(input, { target: { value: '160' } });
    fireEvent.blur(input);

    // result — width doubled, height should follow the same 1.5 ratio (120 -> 240)
    const paint = (selectActivePage(store.getState()).nodes[nodeId] as unknown as { fills: TImagePaint[] }).fills[0];

    expect(paint.crop).toMatchObject({ height: 240, width: 160 });
  });
});
