// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { resolveProgressiveBlurHover } from '../resolveProgressiveBlurHover';

const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive }],
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const createContext = (x: number, y: number, isOpen = true): THoverResolverContext =>
  ({
    openPropertyPanel: isOpen ? { index: 0, nodeId: 'rect-1', property: 'effects' } : null,
    point: { x, y },
    selectedNodes: [node],
    viewport: { x: 0, y: 0, zoom: 1 },
  }) as unknown as THoverResolverContext;

describe('resolveProgressiveBlurHover', () => {
  it('should show the positioning cursor over a handle', () => {
    // result
    expect(resolveProgressiveBlurHover(createContext(50, 99))).toEqual({ className: 'positioning', cursor: '', nodeId: 'rect-1' });
  });

  it('should resolve nothing away from the handles or with the panel closed', () => {
    // result
    expect(resolveProgressiveBlurHover(createContext(10, 50))).toBeUndefined();
    expect(resolveProgressiveBlurHover(createContext(50, 99, false))).toBeUndefined();
  });
});
