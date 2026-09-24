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

const exportNodesMock = vi.fn();

vi.mock('../../utils/exportNodes', () => ({ exportNodes: (...args: unknown[]): unknown => exportNodesMock(...args) }));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const exportTarget: TExportTarget = { id: 'r1', name: 'Rectangle' };

describe('useHandleExportClick', () => {
  beforeEach(() => {
    exportNodesMock.mockReset();
  });

  it('should export the whole page (id null) when there is no selected node', async () => {
    // mock
    const pageTarget: TExportTarget = { id: null, name: 'Page 1' };

    // before
    const { result } = renderHook(() => useHandleExportClick([pageTarget], [DEFAULT_EXPORT_SETTING], 'Page 1'), { wrapper });

    // action
    await act(() => result.current());

    // result
    expect(exportNodesMock).toHaveBeenCalledWith([pageTarget], [DEFAULT_EXPORT_SETTING], 'Page 1');
  });

  it('should mark exporting while the export runs, then clear it once done', async () => {
    // mock
    let resolveExport: () => void = () => {};
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    exportNodesMock.mockReturnValue(exportPromise);

    const { result } = renderHook(() => useHandleExportClick([exportTarget], [DEFAULT_EXPORT_SETTING], 'Rectangle'), { wrapper });

    // action
    let clickPromise: Promise<void> = Promise.resolve();

    act(() => {
      clickPromise = result.current();
    });

    // result — flagged as exporting immediately, with the right node bounds forwarded
    expect(selectIsExporting(store.getState())).toBe(true);
    expect(exportNodesMock).toHaveBeenCalledWith([exportTarget], [DEFAULT_EXPORT_SETTING], 'Rectangle');

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
    exportNodesMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useHandleExportClick([exportTarget], [DEFAULT_EXPORT_SETTING], 'Rectangle'), { wrapper });

    // action
    await act(async () => {
      await expect(result.current()).rejects.toThrow('boom');
    });

    // result
    expect(selectIsExporting(store.getState())).toBe(false);
  });
});
