import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// components
import ImageSourcePreview from './ImageSourcePreview';

// hooks
import { useImagePanel } from '../hooks/useImagePanel';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { store } from 'store';

const ImageSourcePreviewWrapper = (): ReactNode => {
  const imagePanel = useImagePanel();

  return <ImageSourcePreview imagePanel={imagePanel} />;
};

const renderImageSourcePreview = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <ImageSourcePreviewWrapper />
    </Provider>,
  );

describe('ImageSourcePreview snapshots', () => {
  it('should render ImageSourcePreview', () => {
    // before
    const { asFragment } = renderImageSourcePreview();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageSourcePreview behaviors', () => {
  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should render the upload-from-computer button', () => {
    // before
    renderImageSourcePreview();

    // result
    expect(screen.getByRole('button', { name: 'Upload from computer' })).toBeInTheDocument();
  });

  it('should render the make-an-image button', () => {
    // before
    renderImageSourcePreview();

    // result
    expect(screen.getByRole('button', { name: 'Make an image' })).toBeInTheDocument();
  });

  it('should show no background image and no overlay before a file is picked', () => {
    // before
    const { container } = renderImageSourcePreview();

    // result
    expect(container.querySelector('[class*="ImageSourcePreview"]')).toHaveStyle({ backgroundImage: 'none' });
    expect(container.querySelector('[class*="ImageSourcePreview__overlay"]')).toBeNull();
  });

  it('should show the picked image as the background and wrap the buttons in the hover overlay', () => {
    // mock
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // before
    const { container } = renderImageSourcePreview();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // action
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // result — the photo sits centered and proportionally contained above the still-tiled texture,
    // so the texture stays visible in any letterboxed gap around a non-matching aspect ratio
    const overlay = container.querySelector('[class*="ImageSourcePreview__overlay"]');
    const preview = container.querySelector('[class*="ImageSourcePreview"]') as HTMLElement;

    expect(preview.style.backgroundImage).toContain('url("blob:mock-url")');
    expect(preview).toHaveStyle({ backgroundPosition: 'center, center', backgroundRepeat: 'no-repeat, repeat' });
    expect(preview.style.backgroundSize).toBe('contain, 208px 208px');
    expect(overlay).not.toBeNull();
    expect(overlay).toContainElement(screen.getByRole('button', { name: 'Upload from computer' }));
  });

  it('should dispatch a design hint naming the extension when an unsupported file is picked', () => {
    // before
    const { container } = renderImageSourcePreview();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'icon.svg', { type: 'image/svg+xml' });

    // action
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe("This file type (.svg) can't be used as image fill");
    expect(container.querySelector('[class*="ImageSourcePreview__overlay"]')).toBeNull();
  });
});
