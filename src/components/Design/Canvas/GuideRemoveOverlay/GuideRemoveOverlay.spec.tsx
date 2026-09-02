import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import GuideRemoveOverlay from './GuideRemoveOverlay';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

const useGuideToolMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('../hooks/useGuideTool/useGuideTool', () => ({
  useGuideTool: (): unknown => useGuideToolMock(),
}));

const renderOverlay = (): ReturnType<typeof render> => render(<Provider store={store}>{<GuideRemoveOverlay />}</Provider>);

describe('GuideRemoveOverlay', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should render nothing while no guide is selected', () => {
    // mock
    useGuideToolMock.mockReturnValue({ removeSelectedGuide: vi.fn(), selectedGuide: null });

    // before
    const { container } = renderOverlay();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should position the pill at the selected guide’s screen point, accounting for pan and zoom', () => {
    // mock
    store.dispatch(setViewport({ x: 100, y: 200, zoom: 2 }));
    useGuideToolMock.mockReturnValue({
      removeSelectedGuide: vi.fn(),
      selectedGuide: { frameId: null, id: 'guide-1', worldPoint: { x: 50, y: -34 } },
    });

    // before
    const { container } = renderOverlay();

    // result — screen point (50*2+100, -34*2+200) = (200, 132)
    expect(container.firstChild).toHaveStyle({ left: '200px', top: '132px' });
  });

  it('should show the translated remove label', () => {
    // mock
    useGuideToolMock.mockReturnValue({
      removeSelectedGuide: vi.fn(),
      selectedGuide: { frameId: null, id: 'guide-1', worldPoint: { x: 0, y: 0 } },
    });

    // before
    renderOverlay();

    // result
    expect(screen.getByRole('button')).toHaveTextContent('Remove guide');
  });

  it('should call removeSelectedGuide when clicked', () => {
    // mock
    const removeSelectedGuide = vi.fn();

    useGuideToolMock.mockReturnValue({ removeSelectedGuide, selectedGuide: { frameId: null, id: 'guide-1', worldPoint: { x: 0, y: 0 } } });

    // before
    renderOverlay();
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(removeSelectedGuide).toHaveBeenCalled();
  });
});
