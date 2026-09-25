// store
import { RootState } from 'store';

// utils
import { selectImageCropTarget } from '../selectImageCropTarget';

const imagePaint = { type: 'image' };
const videoPaint = { type: 'video' };
const nodes = {
  r: { fills: [imagePaint, { type: 'solid' }, videoPaint], id: 'r', strokes: [imagePaint], type: 'rectangle', x: 0, y: 0 },
  t: { id: 't', type: 'text' },
};

const stateWith = (imageEditor: unknown): RootState =>
  ({ design: { activePageId: 'p', imageEditor, pages: { p: { nodes } } } }) as unknown as RootState;

describe('selectImageCropTarget', () => {
  it('should return the image or video fill being cropped', () => {
    // result
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 'r', paintIndex: 0 }))).toEqual({
      node: nodes.r,
      paint: imagePaint,
      paintIndex: 0,
    });
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 'r', paintIndex: 2, property: 'fills' }))).toEqual({
      node: nodes.r,
      paint: videoPaint,
      paintIndex: 2,
    });
  });

  it('should return nothing outside crop mode, for strokes, other layers or other paints', () => {
    // result
    expect(selectImageCropTarget(stateWith(null))).toBeUndefined();
    expect(selectImageCropTarget(stateWith({ mode: 'adjust', nodeId: 'r', paintIndex: 0 }))).toBeUndefined();
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 'r', paintIndex: 0, property: 'strokes' }))).toBeUndefined();
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 't', paintIndex: 0 }))).toBeUndefined();
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 'r', paintIndex: 1 }))).toBeUndefined();
    expect(selectImageCropTarget(stateWith({ mode: 'crop', nodeId: 'r', paintIndex: 9 }))).toBeUndefined();
  });
});
