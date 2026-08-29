import { act, renderHook, waitFor } from '@testing-library/react';

// hooks
import { useTreeItemNameEditing } from '../useTreeItemNameEditing';

describe('useTreeItemNameEditing', () => {
  it('should start out not editing and with no rename requested', () => {
    // before
    const { result } = renderHook(() => useTreeItemNameEditing());

    // result
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isRenameRequested).toBe(false);
  });

  it('should track isEditing as onEditingChange is called', () => {
    // before
    const { result } = renderHook(() => useTreeItemNameEditing());

    // action
    act(() => result.current.onEditingChange(true));

    // result
    expect(result.current.isEditing).toBe(true);

    // action
    act(() => result.current.onEditingChange(false));

    // result
    expect(result.current.isEditing).toBe(false);
  });

  it('should flag a rename request on the next frame after onRenameRequested is called', async () => {
    // before
    const { result } = renderHook(() => useTreeItemNameEditing());

    // result — nothing requested yet
    expect(result.current.isRenameRequested).toBe(false);

    // action
    act(() => result.current.onRenameRequested());

    // result
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));
  });

  it('should clear the rename request once editing ends', async () => {
    // before
    const { result } = renderHook(() => useTreeItemNameEditing());
    act(() => result.current.onRenameRequested());
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));

    // action
    act(() => result.current.onEditingChange(false));

    // result
    expect(result.current.isRenameRequested).toBe(false);
  });

  it('should keep the rename request while editing is still active', async () => {
    // before
    const { result } = renderHook(() => useTreeItemNameEditing());
    act(() => result.current.onRenameRequested());
    await waitFor(() => expect(result.current.isRenameRequested).toBe(true));

    // action
    act(() => result.current.onEditingChange(true));

    // result
    expect(result.current.isRenameRequested).toBe(true);
  });
});
