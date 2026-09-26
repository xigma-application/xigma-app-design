import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import MultiImageEditToolbar from './MultiImageEditToolbar';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const IMAGE_FILL: TPaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };

const renderMultiImageEditToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <MultiImageEditToolbar />
      </TooltipProvider>
    </Provider>,
  );

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [IMAGE_FILL],
      height: 10,
      name: 'Image',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('MultiImageEditToolbar snapshots', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render Remove background and Boost resolution while several images are selected', () => {
    // mock
    store.dispatch(setSelection([addImageRectangle(), addImageRectangle()]));

    // before
    const { asFragment } = renderMultiImageEditToolbar();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('MultiImageEditToolbar behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show both actions with their text labels while several images are selected', () => {
    // mock
    store.dispatch(setSelection([addImageRectangle(), addImageRectangle()]));

    // before
    renderMultiImageEditToolbar();

    // result
    expect(screen.getByRole('button', { name: 'Remove background' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Boost resolution' })).toBeInTheDocument();
    expect(screen.getByText('Remove background')).toBeInTheDocument();
    expect(screen.getByText('Boost resolution')).toBeInTheDocument();
  });

  it('should render nothing while a single image is selected', () => {
    // mock
    store.dispatch(setSelection([addImageRectangle()]));

    // before
    const { container } = renderMultiImageEditToolbar();

    // result
    expect(container).toBeEmptyDOMElement();
  });
});
