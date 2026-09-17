import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCropPositionSection from './ImageCropPositionSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

const renderImageCropPositionSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageCropPositionSection />
      </TooltipProvider>
    </Provider>,
  );

const addImageCropRectNode = (crop: TImagePaint['crop']): string => {
  const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

  store.dispatch(
    addNode({
      fills: [paint],
      height: 40,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 100,
      y: 50,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const nodeId = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([nodeId]));
  store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'image' }));

  return nodeId;
};

describe('ImageCropPositionSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should render the Position section label along with the X/Y and rotation rows', () => {
    // mock
    addImageCropRectNode({ height: 20, rotation: 0, width: 20, x: 10, y: 10 });

    // before
    renderImageCropPositionSection();

    // result
    expect(screen.getAllByText('Position')).toHaveLength(2);
    expect(screen.getByText('Rotation')).toBeInTheDocument();
  });

  it('should show the crop rect’s own x/y/rotation, not the frame’s', () => {
    // mock — the frame sits at (100,50), the crop rect at (10,10) with a 45° rotation
    addImageCropRectNode({ height: 20, rotation: 45, width: 20, x: 10, y: 10 });

    // before
    renderImageCropPositionSection();

    // result
    expect(screen.getByLabelText('X position')).toHaveValue(10);
    expect(screen.getByLabelText('Y position')).toHaveValue(10);
    expect(screen.getByLabelText('Rotation')).toHaveValue('45°');
  });

  it('should not render the alignment row', () => {
    // mock
    addImageCropRectNode({ height: 20, rotation: 0, width: 20, x: 10, y: 10 });

    // before
    renderImageCropPositionSection();

    // result
    expect(screen.queryByText('Alignment')).not.toBeInTheDocument();
  });
});
