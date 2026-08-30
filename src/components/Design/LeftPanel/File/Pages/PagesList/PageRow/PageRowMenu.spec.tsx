import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import PageRowMenu from './PageRowMenu';

// store
import { addPage, deletePage, setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { store } from 'store';

const writeText = vi.fn();

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderPageRowMenu = (id: string, onRename = vi.fn()): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PageRowMenu anchorRef={anchorRef} id={id} isOpen onOpenChange={vi.fn()} onRename={onRename} />
    </Provider>,
  );

describe('PageRowMenu', () => {
  const initialActivePageId = selectActivePageId(store.getState());

  beforeEach(() => {
    writeText.mockClear();
  });

  afterEach(() => {
    Object.keys(selectPages(store.getState()))
      .filter((pageId) => pageId !== initialActivePageId)
      .forEach((pageId) => store.dispatch(deletePage(pageId)));
    store.dispatch(setActivePage(initialActivePageId));
  });

  it('should show all four actions when open', () => {
    // before
    renderPageRowMenu(initialActivePageId);

    // result
    expect(screen.getByText('Copy link to page')).toBeInTheDocument();
    expect(screen.getByText('Rename page')).toBeInTheDocument();
    expect(screen.getByText('Duplicate page')).toBeInTheDocument();
    expect(screen.getByText('Delete page')).toBeInTheDocument();
  });

  it('should disable Delete page while there is only one page', () => {
    // before
    renderPageRowMenu(initialActivePageId);

    // result
    expect(screen.getByText('Delete page').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should delete the page on Delete page click once a second page exists', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(addPage());
    const secondId = selectActivePageId(store.getState());

    // before
    renderPageRowMenu(secondId);

    // action
    await user.click(screen.getByText('Delete page'));

    // result
    expect(selectPages(store.getState())[secondId]).toBeUndefined();
  });

  it('should duplicate the page on Duplicate page click', async () => {
    // mock
    const user = userEvent.setup();
    const countBefore = Object.keys(selectPages(store.getState())).length;

    // before
    renderPageRowMenu(initialActivePageId);

    // action
    await user.click(screen.getByText('Duplicate page'));

    // result
    expect(Object.keys(selectPages(store.getState()))).toHaveLength(countBefore + 1);
  });

  it('should copy the page link on Copy link to page click', async () => {
    // mock
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    // before
    renderPageRowMenu(initialActivePageId);

    // action
    await user.click(screen.getByText('Copy link to page'));

    // result
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?page=${initialActivePageId}`);
  });

  it('should call onRename on Rename page click', async () => {
    // mock
    const user = userEvent.setup();
    const onRename = vi.fn();

    // before
    renderPageRowMenu(initialActivePageId, onRename);

    // action
    await user.click(screen.getByText('Rename page'));

    // result
    expect(onRename).toHaveBeenCalledTimes(1);
  });
});
