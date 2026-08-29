import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import PageRow from './PageRow';

// store
import { setActivePage } from 'store/design/slice';
import { selectActivePageId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TDesignPage } from 'store/design/types';

const buildPage = (overrides: Partial<TDesignPage> = {}): TDesignPage => ({
  comments: {},
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

const renderPageRow = (page: TDesignPage, autoEdit = false): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/design/file-1']}>
        <Routes>
          <Route element={<PageRow autoEdit={autoEdit} page={page} />} path="/design/:id" />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('PageRow', () => {
  it("should render the page's name as an editable input", () => {
    // before
    renderPageRow(buildPage({ name: 'My page' }));

    // result
    expect(screen.getByText('My page')).toBeInTheDocument();
  });

  it('should mark the input as selected when the page is the active page', () => {
    // mock
    const activePageId = selectActivePageId(store.getState());

    // before
    renderPageRow(buildPage({ id: activePageId, name: 'Active page' }));

    // result
    expect(screen.getByText('Active page').parentElement?.className).toMatch(/EditableInput--selected/);
  });

  it('should not mark the input as selected when the page is not the active page', () => {
    // before
    renderPageRow(buildPage({ id: 'not-the-active-page', name: 'Other page' }));

    // result
    expect(screen.getByText('Other page').parentElement?.className).not.toMatch(/EditableInput--selected/);
  });

  it('should select the page on a single click on the row', () => {
    // mock
    const initialActivePageId = selectActivePageId(store.getState());

    // before
    renderPageRow(buildPage({ id: 'clicked-page', name: 'Clicked page' }));

    // action
    fireEvent.click(screen.getByText('Clicked page'));

    // result
    expect(selectActivePageId(store.getState())).toBe('clicked-page');

    // after
    store.dispatch(setActivePage(initialActivePageId));
  });

  it('should not enter rename mode on a single click', () => {
    // before
    renderPageRow(buildPage({ name: 'Page 1' }));

    // action
    fireEvent.click(screen.getByText('Page 1'));

    // result
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should enter rename mode on a double click', () => {
    // before
    renderPageRow(buildPage({ name: 'Page 1' }));

    // action
    fireEvent.doubleClick(screen.getByText('Page 1'));

    // result
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should start in rename mode when autoEdit is set', () => {
    // before
    renderPageRow(buildPage({ name: 'Page 2' }), true);

    // result
    expect(screen.getByRole('textbox')).toHaveValue('Page 2');
  });

  it('should open the page menu on right-click', () => {
    // before
    renderPageRow(buildPage({ name: 'Page 1' }));

    // action
    fireEvent.contextMenu(screen.getByText('Page 1'));

    // result
    expect(screen.getByText('Delete page')).toBeInTheDocument();
  });

  it('should enter rename mode when the menu Rename page action is chosen', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderPageRow(buildPage({ name: 'Page 1' }));

    // action
    fireEvent.contextMenu(screen.getByText('Page 1'));
    await user.click(screen.getByText('Rename page'));

    // result
    expect(await screen.findByRole('textbox')).toHaveValue('Page 1');
  });

  it('should highlight a non-active row while its menu is open', () => {
    // before
    renderPageRow(buildPage({ id: 'not-the-active-page', name: 'Other page' }));

    // result — no highlight yet
    expect(document.querySelector('[class*="PageRow__input--menu-open"]')).toBeNull();

    // action
    fireEvent.contextMenu(screen.getByText('Other page'));

    // result
    expect(document.querySelector('[class*="PageRow__input--menu-open"]')).not.toBeNull();
  });

  it('should not add the menu-open highlight to the active row', () => {
    // mock
    const activePageId = selectActivePageId(store.getState());

    // before
    renderPageRow(buildPage({ id: activePageId, name: 'Active page' }));

    // action
    fireEvent.contextMenu(screen.getByText('Active page'));

    // result
    expect(document.querySelector('[class*="PageRow__input--menu-open"]')).toBeNull();
  });
});
