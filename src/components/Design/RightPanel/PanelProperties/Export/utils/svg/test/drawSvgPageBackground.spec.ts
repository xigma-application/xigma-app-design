// utils
import { drawSvgPageBackground } from '../drawSvgPageBackground';

describe('drawSvgPageBackground', () => {
  it('should add an opaque background rect covering the page', () => {
    // mock
    const elements: string[] = [];

    // before
    drawSvgPageBackground(elements, { height: 20, width: 40, x: 0, y: 0 }, { color: '#ffffff', opacity: 100, type: 'solid' });

    // result
    expect(elements).toEqual(['<rect width="40" height="20" fill="#ffffff"/>']);
  });

  it('should add a fill opacity for a translucent background', () => {
    // mock
    const elements: string[] = [];

    // before
    drawSvgPageBackground(elements, { height: 20, width: 40, x: 0, y: 0 }, { color: '#000000', opacity: 50, type: 'solid' });

    // result
    expect(elements).toEqual(['<rect width="40" height="20" fill="#000000" fill-opacity="0.5"/>']);
  });
});
