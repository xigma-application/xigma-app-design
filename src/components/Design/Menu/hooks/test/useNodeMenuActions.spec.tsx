import { FC, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useNodeMenuActions } from '../useNodeMenuActions';

// store
import { addPage, setActivePage } from 'store/design/slice';
import { store } from 'store';

vi.mock('../useBringSelectionToFront', () => ({ useBringSelectionToFront: (): string => 'bringToFront' }));
vi.mock('../useConvertSelectionToFrame', () => ({ useConvertSelectionToFrame: (): string => 'convertToFrame' }));
vi.mock('../useConvertSelectionToSection', () => ({ useConvertSelectionToSection: (): string => 'convertToSection' }));
vi.mock('../useCopySelection', () => ({ useCopySelection: (): string => 'copy' }));
vi.mock('../useFlattenSelection', () => ({ useFlattenSelection: (): string => 'flatten' }));
vi.mock('../useFlipSelection', () => ({ useFlipSelection: (): unknown => ({ onFlipHorizontal: 'flipH', onFlipVertical: 'flipV' }) }));
vi.mock('../useGroupSelection', () => ({ useGroupSelection: (): string => 'group' }));
vi.mock('../useMoveSelectionToPage', () => ({ useMoveSelectionToPage: (): string => 'moveToPage' }));
vi.mock('../useOutlineStrokeSelection', () => ({ useOutlineStrokeSelection: (): string => 'outlineStroke' }));
vi.mock('../usePasteToReplace', () => ({ usePasteToReplace: (): string => 'pasteToReplace' }));
vi.mock('../useSendSelectionToBack', () => ({ useSendSelectionToBack: (): string => 'sendToBack' }));
vi.mock('../useUngroupSelection', () => ({ useUngroupSelection: (): string => 'ungroup' }));
vi.mock('../useUseSelectionAsMask', () => ({ useUseSelectionAsMask: (): string => 'useAsMask' }));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useNodeMenuActions', () => {
  it('should gather every layer menu action and list the pages other than the active one', () => {
    // mock
    const activePageId = store.getState().design.activePageId;
    store.dispatch(addPage());
    store.dispatch(setActivePage(activePageId));

    // before
    const { result } = renderHook(() => useNodeMenuActions(), { wrapper });

    // result
    expect(result.current).toMatchObject({
      onBringToFront: 'bringToFront',
      onConvertToFrame: 'convertToFrame',
      onConvertToSection: 'convertToSection',
      onCopy: 'copy',
      onFlatten: 'flatten',
      onFlipHorizontal: 'flipH',
      onFlipVertical: 'flipV',
      onGroupSelection: 'group',
      onMoveToPage: 'moveToPage',
      onOutlineStroke: 'outlineStroke',
      onPasteToReplace: 'pasteToReplace',
      onSendToBack: 'sendToBack',
      onUngroupSelection: 'ungroup',
      onUseAsMask: 'useAsMask',
    });
    expect(result.current.otherPages.length).toBeGreaterThan(0);
    expect(result.current.otherPages.map((page) => page.id)).not.toContain(activePageId);
  });
});
