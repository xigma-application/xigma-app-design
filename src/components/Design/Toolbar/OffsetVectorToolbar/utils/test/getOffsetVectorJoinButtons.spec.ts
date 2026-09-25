// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { getOffsetVectorJoinButtons } from '../getOffsetVectorJoinButtons';

describe('getOffsetVectorJoinButtons', () => {
  it('should offer a sharp and a round corner button, labelled and iconed', () => {
    // result
    expect(getOffsetVectorJoinButtons((join) => `label-${join}`)).toEqual([
      { ariaLabel: 'label-miter', icon: 'StrokeJoinMiter', tooltip: 'label-miter', value: StrokeJoin.miter },
      { ariaLabel: 'label-round', icon: 'StrokeJoinRound', tooltip: 'label-round', value: StrokeJoin.round },
    ]);
  });
});
