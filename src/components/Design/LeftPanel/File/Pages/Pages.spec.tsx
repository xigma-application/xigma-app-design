import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';

// components
import Pages from './Pages';
import { TooltipProvider } from 'shared';

// store
import designReducer from 'store/design/slice';
import { store } from 'store';

// types
import { TDesignState } from 'store/design/types';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

type TStore = EnhancedStore<{ design: TDesignState }> | typeof store;

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderPages = (testStore: TStore = store): ReturnType<typeof render> =>
  render(
    <Provider store={testStore}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/design/file-1']}>
          <Pages />
        </MemoryRouter>
      </TooltipProvider>
    </Provider>,
  );

describe('Pages snapshots', () => {
  it('should render Pages', () => {
    // before
    const { asFragment } = renderPages();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Pages behaviors', () => {
  beforeEach(() => {
    stubVirtualizerViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the active page name from the store, collapsed by default', () => {
    // before
    renderPages();

    // result
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('should render the search and add-page buttons', () => {
    // before
    renderPages();

    // result
    expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add new page' })).toBeInTheDocument();
  });

  it('should expand and show the static "Pages" title and the page list when the header is clicked', () => {
    // before
    renderPages();

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getAllByText('Page 1')).toHaveLength(1);
  });

  it('should collapse again when the header is clicked a second time', () => {
    // before
    renderPages();
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // action
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    expect(screen.queryByText('Pages')).not.toBeInTheDocument();
  });

  it('should not toggle the expanded state when the search button is clicked', () => {
    // before
    renderPages();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Find' }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('should open the active-page menu on right-click of the collapsed header', () => {
    // before
    renderPages();

    // action
    fireEvent.contextMenu(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByText('Delete page')).toBeInTheDocument();
  });

  it('should not open the header menu on right-click once expanded', () => {
    // before
    renderPages();
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // action
    fireEvent.contextMenu(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.queryByText('Delete page')).not.toBeInTheDocument();
  });

  it('should add a page, expand the panel, select it and open its name for editing when the add button is clicked', () => {
    // before
    renderPages(createTestStore());

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Add new page' }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Page 2');
  });
});
