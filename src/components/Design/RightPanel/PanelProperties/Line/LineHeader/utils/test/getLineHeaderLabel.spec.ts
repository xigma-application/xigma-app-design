import { TFunction } from 'i18next';

// utils
import { getLineHeaderLabel } from '../getLineHeaderLabel';

const t = ((key: string, options?: { count: number }) => (options ? `${key}:${options.count}` : key)) as unknown as TFunction;

describe('getLineHeaderLabel', () => {
  it('should title a single plain line Line', () => {
    // result
    expect(getLineHeaderLabel(t, 1, 0)).toBe('design.rightPanel.panelProperties.line.header.label');
  });

  it('should title a single arrow Arrow', () => {
    // result
    expect(getLineHeaderLabel(t, 1, 1)).toBe('design.rightPanel.panelProperties.line.header.arrowLabel');
  });

  it('should count several lines or arrows as selected', () => {
    // result
    expect(getLineHeaderLabel(t, 2, 2)).toBe('design.rightPanel.panelProperties.mixed.header.label:2');
    expect(getLineHeaderLabel(t, 3, 1)).toBe('design.rightPanel.panelProperties.mixed.header.label:3');
    expect(getLineHeaderLabel(t, 2, 0)).toBe('design.rightPanel.panelProperties.mixed.header.label:2');
  });
});
