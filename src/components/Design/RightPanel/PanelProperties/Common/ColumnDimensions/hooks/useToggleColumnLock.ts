// hooks
import { useAppDispatch } from 'store';

// store
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';

export const useToggleColumnLock = (id: string, locked: boolean, widthSizingMode: SizingMode, heightSizingMode: SizingMode): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    const nextLocked = !locked;
    const sizingModeChanges =
      nextLocked && (widthSizingMode !== SizingMode.fixed || heightSizingMode !== SizingMode.fixed)
        ? { heightSizingMode: SizingMode.fixed, widthSizingMode: SizingMode.fixed }
        : {};

    dispatch(updateNode({ changes: { lockedAspectRatio: nextLocked, ...sizingModeChanges }, id }));
  };
};
