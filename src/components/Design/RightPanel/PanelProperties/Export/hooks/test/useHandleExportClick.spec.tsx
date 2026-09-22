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
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const exportNodeMock = vi.fn();

vi.mock('../../utils/exportNode', () => ({ exportNode: (...args: unknown[]): unknown => exportNodeMock(...args) }));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const node = {
  fills: [],
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
} as TSceneNode;

describe('useHandleExportClick', () => {
  beforeEach(() => {
    exportNodeMock.mockReset();
  });

  it('should do nothing when there is no selected node', async () => {
    // before
    const { result } = renderHook(() => useHandleExportClick(undefined, [DEFAULT_EXPORT_SETTING]), { wrapper });

    // action
    await act(() => result.current());

    // result
    expect(exportNodeMock).not.toHaveBeenCalled();
  });

  it('should mark exporting while the export runs, then clear it once done', async () => {
    // mock
    let resolveExport: () => void = () => {};
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    exportNodeMock.mockReturnValue(exportPromise);

    const { result } = renderHook(() => useHandleExportClick(node, [DEFAULT_EXPORT_SETTING]), { wrapper });

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

    const { result } = renderHook(() => useHandleExportClick(node, [DEFAULT_EXPORT_SETTING]), { wrapper });

    // action
    await act(async () => {
      await expect(result.current()).rejects.toThrow('boom');
    });

    // result
    expect(selectIsExporting(store.getState())).toBe(false);
  });
});
