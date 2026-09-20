// types
import { EffectType, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { hasFrameNoiseOverChildren } from '../hasFrameNoiseOverChildren';

const frame: TFrameNode = {
  childIds: ['c1'],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'f1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

describe('hasFrameNoiseOverChildren', () => {
  it('should be true for a frame with children and a visible noise', () => {
    // result
    expect(hasFrameNoiseOverChildren({ ...frame, effects: [createEffect(EffectType.noise)] })).toBe(true);
  });

  it('should be false without children, without a noise, for a hidden noise, or for other node types', () => {
    // result
    expect(hasFrameNoiseOverChildren({ ...frame, childIds: [], effects: [createEffect(EffectType.noise)] })).toBe(false);
    expect(hasFrameNoiseOverChildren({ ...frame, effects: [createEffect(EffectType.dropShadow)] })).toBe(false);
    expect(hasFrameNoiseOverChildren({ ...frame, effects: [{ ...createEffect(EffectType.noise), visible: false }] })).toBe(false);
    expect(hasFrameNoiseOverChildren(frame)).toBe(false);
    expect(hasFrameNoiseOverChildren({ ...frame, type: NodeType.rectangle } as never)).toBe(false);
  });
});
