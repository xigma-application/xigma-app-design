// utils
import { getAutoLayoutRowFrame } from '../getAutoLayoutRowFrame';

const CONTENT_BOX = { height: 400, width: 250, x: 10, y: 20 };

describe('getAutoLayoutRowFrame', () => {
  it('should build a full-width band restricted to the row’s own vertical range, for a horizontal frame', () => {
    // action — row band y[120,220] within the content box
    const rowFrame = getAutoLayoutRowFrame(true, CONTENT_BOX, 120, 220);

    // result — full content box width, but only the row's own 100px-tall band, offset by the
    // content box's own origin
    expect(rowFrame).toEqual({ height: 100, width: 250, x: 10, y: 140 });
  });

  it('should build a full-height band restricted to the row’s own horizontal range, for a vertical frame', () => {
    // action — column band x[120,220] within the content box
    const rowFrame = getAutoLayoutRowFrame(false, CONTENT_BOX, 120, 220);

    // result
    expect(rowFrame).toEqual({ height: 400, width: 100, x: 130, y: 20 });
  });
});
