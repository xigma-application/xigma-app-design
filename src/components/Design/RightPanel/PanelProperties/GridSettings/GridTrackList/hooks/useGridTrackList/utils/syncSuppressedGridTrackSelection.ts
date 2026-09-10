export const syncSuppressedGridTrackSelection = (isSuppressed: boolean, clearSelection: () => void): void => {
  if (isSuppressed) {
    clearSelection();
  }
};
