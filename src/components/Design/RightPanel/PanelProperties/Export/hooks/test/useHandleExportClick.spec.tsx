import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useHandleExportClick } from '../useHandleExportClick';

// others
import { DEFAULT_EXPORT_SETTING } from '../../constants';

// store
import { selectIsExporting } from 'store/design/selectors';
import { store } from 'store';

// types
import { TExportTarget } from '../../types';

const exportNodeMock = vi.fn();

vi.mock('../../utils/exportNode', () => ({ exportNode: (...args: unknown[]): unknown => exportNodeMock(...args) }));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const exportTarget: TExportTarget = { id: 'r1', name: 'Rectangle' };

describe('useHandleExportClick', () => {
  beforeEach(() => {
    exportNodeMock.mockReset();
  });

  it('should export the whole page (id null) when there is no selected node', async () => {
    // mock
    const pageTarget: TExportTarget = { id: null, name: 'Page 1' };

    // before
    const { result } = renderHook(() => useHandleExportClick(pageTarget, [DEFAULT_EXPORT_SETTING]), { wrapper });

    // action
    await act(() => result.current());

    // result
    expect(exportNodeMock).toHaveBeenCalledWith(null, 'Page 1', [DEFAULT_EXPORT_SETTING]);
  });

  it('should mark exporting while the export runs, then clear it once done', async () => {
    // mock
    let resolveExport: () => void = () => {};
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    exportNodeMock.mockReturnValue(exportPromise);

    const { result } = renderHook(() => useHandleExportClick(exportTarget, [DEFAULT_EXPORT_SETTING]), { wrapper });

    // action
    let clickPromise: Promise<void> = Promise.resolve();

    act(() => {
      clickPromise = result.current();
    });

    // result — flagged as exporting immediately, with the right node bounds forwarded
    expect(selectIsExporting(store.getState())).toBe(true);
    expect(exportNodeMock).toHaveBeenCalledWith('r1', 'Rectangle', [DEFAULT_EXPORT_SETTING]);

    // action
    await act(async () => {
      resolveExport();
      await clickPromise;
    });

    // result
    expect(selectIsExporting(store.getState())).toBe(false);
  });

  it('should clear the exporting flag even when the export throws', async () => {
    // mock
    exportNodeMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useHandleExportClick(exportTarget, [DEFAULT_EXPORT_SETTING]), { wrapper });

    // action
    await act(async () => {
      await expect(result.current()).rejects.toThrow('boom');
    });

    // result
    expect(selectIsExporting(store.getState())).toBe(false);
  });
});
