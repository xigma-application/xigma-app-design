import { act, renderHook, waitFor } from '@testing-library/react';

// hooks
import { useFileNameRename } from '../useFileNameRename';

describe('useFileNameRename', () => {
  it('should start out with no rename requested', () => {
    // before
    const { result } = renderHook(() => useFileNameRename());

    // result
    expect(result.current.isRenameRequested).toBe(false);
  });

  it('should flag a rename request on the next frame after onRename is called', async () => {
    // before
    const { result } = renderHook(() => useFileNameRename());

    // result — nothing requested yet
    expect(result.current.isRenameRequested).toBe(false);

    // action
    act(() => result.current.onRename());

    // result
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));
  });

  it('should clear the rename request once editing ends', async () => {
    // before
    const { result } = renderHook(() => useFileNameRename());
    act(() => result.current.onRename());
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));

    // action
    act(() => result.current.onEditingChange(false));

    // result
    expect(result.current.isRenameRequested).toBe(false);
  });

  it('should keep the rename request while editing is still active', async () => {
    // before
    const { result } = renderHook(() => useFileNameRename());
    act(() => result.current.onRename());
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));

    // action
    act(() => result.current.onEditingChange(true));

    // result
    expect(result.current.isRenameRequested).toBe(true);
  });
});
