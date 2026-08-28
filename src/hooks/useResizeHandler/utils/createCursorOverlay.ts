export const createCursorOverlay = (cursor: string): TFunc<[]> => {
  const overlay = document.createElement('div');

  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '999999';
  overlay.style.cursor = cursor;
  document.body.appendChild(overlay);

  return (): void => {
    overlay.remove();
  };
};
