let selectionAnchorId: string | null = null;

export const setSelectionAnchorId = (id: string | null): void => {
  selectionAnchorId = id;
};

export const getSelectionAnchorId = (): string | null => selectionAnchorId;
