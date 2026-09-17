import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ImageCropToolbar from './ImageCropToolbar';
import { TooltipProvider } from 'shared';

// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

const renderImageCropToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ImageCropToolbar />
      </TooltipProvider>
    </Provider>,
  );

describe('ImageCropToolbar', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should render nothing while crop mode is not active', () => {
    const { container } = renderImageCropToolbar();

    expect(container).toBeEmptyDOMElement();
  });

  it('should render every control once crop mode is active', () => {
    act(() => store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 })));

    renderImageCropToolbar();

    expect(screen.getByText('Crop')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aspect ratio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
});
