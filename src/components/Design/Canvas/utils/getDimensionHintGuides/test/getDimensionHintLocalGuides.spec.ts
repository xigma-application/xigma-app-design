// utils
import { getDimensionHintLocalGuides } from '../getDimensionHintLocalGuides';

// types
import { TDimensionHintFrame } from '../types';

const frame: TDimensionHintFrame = { height: 200, maxHeight: 400, maxWidth: 500, minHeight: 80, minWidth: 156, width: 300, x: 100, y: 50 };

describe('getDimensionHintLocalGuides', () => {
  it('should combine the width edge, min and max guides for the "width" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'width');

    expect(guides.lines).toHaveLength(1 + 1 + 3);
    expect(guides.labels.map((label) => label.text)).toEqual(['Min W 156', 'Max W 500']);
  });

  it('should combine the height edge, min and max guides for the "height" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'height');

    expect(guides.lines).toHaveLength(1 + 1 + 3);
    expect(guides.labels.map((label) => label.text)).toEqual(['Min H 80', 'Max H 400']);
  });

  it('should return only the min-width guide for the "minWidth" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'minWidth');

    expect(guides.labels.map((label) => label.text)).toEqual(['Min W 156']);
  });

  it('should return only the min-height guide for the "minHeight" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'minHeight');

    expect(guides.labels.map((label) => label.text)).toEqual(['Min H 80']);
  });

  it('should return only the max-width guide for the "maxWidth" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'maxWidth');

    expect(guides.labels.map((label) => label.text)).toEqual(['Max W 500']);
  });

  it('should return only the max-height guide for the "maxHeight" field', () => {
    const guides = getDimensionHintLocalGuides(frame, 'maxHeight');

    expect(guides.labels.map((label) => label.text)).toEqual(['Max H 400']);
  });
});
