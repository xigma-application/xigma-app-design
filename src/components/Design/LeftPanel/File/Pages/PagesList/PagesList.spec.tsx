import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import PagesList from './PagesList';

// others
import { PAGES_LIST_DEFAULT_HEIGHT, PAGES_LIST_MIN_HEIGHT } from './constants';

// store
import { selectPages } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getMaxPagesListHeight } from './utils/getMaxPagesListHeight';
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const renderPagesList = (pendingEditPageId: string | null = null): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PagesList pendingEditPageId={pendingEditPageId} />
    </Provider>,
  );

describe('PagesList', () => {
  beforeEach(() => {
    stubVirtualizerViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should render one row per page in the store', () => {
    // mock
    const pages = Object.values(selectPages(store.getState()));

    // before
    renderPagesList();

    // result
    pages.forEach((page) => {
      expect(screen.getByText(page.name)).toBeInTheDocument();
    });
  });

  it('should start the row for the pending-edit page in rename mode', () => {
    // mock
    const [firstPage] = Object.values(selectPages(store.getState()));

    // before
    renderPagesList(firstPage.id);

    // result
    expect(screen.getByRole('textbox')).toHaveValue(firstPage.name);
  });

  it('should render at its default height', () => {
    // before
    const { container } = renderPagesList();

    // result
    expect((container.firstChild as HTMLElement).style.height).toBe(`${PAGES_LIST_DEFAULT_HEIGHT}px`);
  });

  it('should grow when the resize handle is dragged down', () => {
    // before
    const { container } = renderPagesList();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 250 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe('150px');
  });

  it('should clamp to the min height when dragged past it', () => {
    // before
    const { container } = renderPagesList();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 100 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe(`${PAGES_LIST_MIN_HEIGHT}px`);
  });

  it('should clamp to the viewport-based max height when dragged past it', () => {
    // before
    const { container } = renderPagesList();
    const list = container.firstChild as HTMLElement;
    const handle = list.querySelector('[class*="resize-handle"]')!;

    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);

    // action
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(document, { clientY: 100000 });
    fireEvent.mouseUp(document);

    // result
    expect(list.style.height).toBe(`${getMaxPagesListHeight()}px`);
  });
});
