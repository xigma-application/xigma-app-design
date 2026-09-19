// utils
import { getDockedPanelTop } from '../getDockedPanelTop';

const mockRect = (element: HTMLElement, top: number): void => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
};

describe('getDockedPanelTop', () => {
  it('should return the docked element top offset relative to the container', () => {
    // before
    const container = document.createElement('div');
    const docked = document.createElement('div');

    mockRect(container, 100);
    mockRect(docked, 140);

    // action
    const result = getDockedPanelTop(container, docked);

    // result
    expect(result).toBe(40);
  });

  it('should return a negative offset when the docked element sits above the container top', () => {
    // before
    const container = document.createElement('div');
    const docked = document.createElement('div');

    mockRect(container, 200);
    mockRect(docked, 150);

    // action
    const result = getDockedPanelTop(container, docked);

    // result
    expect(result).toBe(-50);
  });
});
