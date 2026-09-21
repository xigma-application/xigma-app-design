import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import ExportHint from './ExportHint';

// store
import { setIsExporting } from 'store/design/slice';
import { store } from 'store';

const renderExportHint = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <ExportHint />
    </Provider>,
  );

describe('ExportHint behaviors', () => {
  afterEach(() => {
    store.dispatch(setIsExporting(false));
  });

  it('should render nothing while not exporting', () => {
    // before
    renderExportHint();

    // result
    expect(screen.queryByText('Exporting...')).not.toBeInTheDocument();
  });

  it('should show the exporting label while an export is in progress', () => {
    // mock
    store.dispatch(setIsExporting(true));

    // before
    renderExportHint();

    // result
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
  });
});
