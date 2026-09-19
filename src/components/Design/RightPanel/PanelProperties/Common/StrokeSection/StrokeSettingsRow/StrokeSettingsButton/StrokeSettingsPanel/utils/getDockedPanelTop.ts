export const getDockedPanelTop = (container: HTMLElement, docked: HTMLElement): number =>
  docked.getBoundingClientRect().top - container.getBoundingClientRect().top;
