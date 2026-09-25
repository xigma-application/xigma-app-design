import { TFunction } from 'i18next';

// utils
import { getLineHeaderLabel } from '../getLineHeaderLabel';

const t = ((key: string, options?: { count: number }) => (options ? `${key}:${options.count}` : key)) as unknown as TFunction;

describe('getLineHeaderLabel', () => {
  it('should title plain lines Line', () => {
    // result
    expect(getLineHeaderLabel(t, 2, 0)).toBe('design.rightPanel.panelProperties.line.header.label');
  });

  it('should title arrows only Arrow', () => {
    // result
    expect(getLineHeaderLabel(t, 2, 2)).toBe('design.rightPanel.panelProperties.line.header.arrowLabel');
  });

  it('should count the layers of an arrows and lines mix as selected', () => {
    // result
    expect(getLineHeaderLabel(t, 3, 1)).toBe('design.rightPanel.panelProperties.mixed.header.label:3');
  });
});
