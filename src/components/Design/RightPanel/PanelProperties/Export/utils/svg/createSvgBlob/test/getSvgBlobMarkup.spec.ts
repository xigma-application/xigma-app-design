// utils
import { getSvgBlobMarkup } from '../getSvgBlobMarkup';

describe('getSvgBlobMarkup', () => {
  it('should build a self-contained svg with no defs block when there are no defs', () => {
    const markup = getSvgBlobMarkup({ height: 30, width: 40, x: 0, y: 0 }, [], ['<path d="M0 0Z" fill="#ff0000"/>']);

    expect(markup).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30"><path d="M0 0Z" fill="#ff0000"/></svg>',
    );
  });

  it('should wrap accumulated defs in one <defs> block before the elements', () => {
    const markup = getSvgBlobMarkup(
      { height: 30, width: 40, x: 0, y: 0 },
      ['<linearGradient id="XigmaGradient0"></linearGradient>'],
      ['<path d="M0 0Z" fill="url(#XigmaGradient0)"/>'],
    );

    expect(markup).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30">' +
        '<defs><linearGradient id="XigmaGradient0"></linearGradient></defs>' +
        '<path d="M0 0Z" fill="url(#XigmaGradient0)"/></svg>',
    );
  });

  it('should format the width/height/viewBox from the given bounds, rounded to 6 decimals', () => {
    const markup = getSvgBlobMarkup({ height: 10.123456789, width: 20.987654321, x: 5, y: 5 }, [], []);

    expect(markup).toContain('width="20.987654" height="10.123457"');
    expect(markup).toContain('viewBox="0 0 20.987654 10.123457"');
  });
});
