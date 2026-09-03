export const canReplaceSelectionWithClipboard = (selectedIds: string[], clipboardRootIds: string[]): boolean => {
  const canPairByIndex = clipboardRootIds.length === selectedIds.length;

  return selectedIds.length > 0 && (clipboardRootIds.length === 1 || canPairByIndex);
};
