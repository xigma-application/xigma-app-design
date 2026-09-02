import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import GuideContextMenuPanel from './GuideContextMenuPanel';

// store
import { addGuide, setViewport } from 'store/design/slice';
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';

const useGuideToolMock = vi.fn();

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({
  useCanvasRefsContext: (): unknown => ({}),
}));
vi.mock('../hooks/useGuideTool/useGuideTool', () => ({
  useGuideTool: (): unknown => useGuideToolMock(),
}));

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(0, 0, 0, 0) } };

const renderPanel = (): ReturnType<typeof render> => render(<Provider store={store}>{<GuideContextMenuPanel />}</Provider>);

describe('GuideContextMenuPanel', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should render nothing while neither menu is armed', () => {
    // mock
    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: false,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide: vi.fn(),
      rulerMenu: null,
      selectedGuide: null,
    });

    // before
    const { container } = renderPanel();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the single-guide menu when a guide is selected', () => {
    // mock
    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide: vi.fn(),
      rulerMenu: null,
      selectedGuide: { frameId: null, id: 'guide-1' },
    });

    // before
    renderPanel();

    // result
    expect(screen.getByText('Remove guide')).toBeInTheDocument();
  });

  it('should call removeSelectedGuide when the single-guide menu item is clicked', async () => {
    // mock
    const user = userEvent.setup();
    const removeSelectedGuide = vi.fn();

    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide,
      rulerMenu: null,
      selectedGuide: { frameId: null, id: 'guide-1' },
    });

    // before
    renderPanel();
    await user.click(screen.getByText('Remove guide'));

    // result
    expect(removeSelectedGuide).toHaveBeenCalled();
  });

  it('should render the ruler menu, showing "Remove all vertical guides" when a matching guide exists', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 10 }));
    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide: vi.fn(),
      rulerMenu: { axis: 'x' },
      selectedGuide: null,
    });

    // before
    renderPanel();

    // result
    expect(screen.getByText('Remove all vertical guides')).toBeInTheDocument();
    expect(screen.getByText('Hide rulers')).toBeInTheDocument();
  });

  it('should hide "Remove all guides" when there is nothing to remove on that axis', () => {
    // mock — no axis-y guides in the store
    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide: vi.fn(),
      rulerMenu: { axis: 'y' },
      selectedGuide: null,
    });

    // before
    renderPanel();

    // result
    expect(screen.queryByText('Remove all horizontal guides')).not.toBeInTheDocument();
    expect(screen.getByText('Hide rulers')).toBeInTheDocument();
  });

  it('should toggle rulers when "Hide rulers" is clicked', async () => {
    // mock
    const user = userEvent.setup();
    const wasVisible = selectAreRulersVisible(store.getState());

    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides: vi.fn(),
      removeSelectedGuide: vi.fn(),
      rulerMenu: { axis: 'x' },
      selectedGuide: null,
    });

    // before
    renderPanel();
    await user.click(screen.getByText('Hide rulers'));

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(!wasVisible);
  });

  it('should call removeAllGuides when "Remove all vertical guides" is clicked', async () => {
    // mock
    const user = userEvent.setup();
    const removeAllGuides = vi.fn();

    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 10 }));
    useGuideToolMock.mockReturnValue({
      anchorRef,
      isMenuOpen: true,
      onMenuOpenChange: vi.fn(),
      removeAllGuides,
      removeSelectedGuide: vi.fn(),
      rulerMenu: { axis: 'x' },
      selectedGuide: null,
    });

    // before
    renderPanel();
    await user.click(screen.getByText('Remove all vertical guides'));

    // result
    expect(removeAllGuides).toHaveBeenCalled();
  });
});
