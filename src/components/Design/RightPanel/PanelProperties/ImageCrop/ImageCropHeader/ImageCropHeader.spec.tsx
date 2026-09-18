import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCropHeader from './ImageCropHeader';
import { TooltipProvider } from 'shared';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const renderImageCropHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageCropHeader />
      </TooltipProvider>
    </Provider>,
  );

const addCropTargetNode = (paint: TPaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const nodeId = rootOrder[rootOrder.length - 1];

  store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'image' }));

  return nodeId;
};

describe('ImageCropHeader snapshots', () => {
  it('should render the Image label with no buttons', () => {
    // before
    const { asFragment } = renderImageCropHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageCropHeader behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should render the Image label by default (no crop target selected)', () => {
    // before
    renderImageCropHeader();

    // result
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should render the Image label when the crop target is an image paint', () => {
    // before
    addCropTargetNode({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' });
    renderImageCropHeader();

    // result
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('should render the Video label when the crop target is a video paint', () => {
    // before
    addCropTargetNode({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'video' });
    renderImageCropHeader();

    // result
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.queryByText('Image')).not.toBeInTheDocument();
  });

  it('should not render a create component button or an element type menu', () => {
    // before
    renderImageCropHeader();

    // result
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });
});
