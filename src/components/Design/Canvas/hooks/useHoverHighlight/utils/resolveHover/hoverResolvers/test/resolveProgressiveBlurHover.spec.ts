// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
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
    refs: createCanvasRefs(),
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

  it('should record the hovered endpoint, and clear it once the pointer leaves', () => {
    // mock
    const onHandle = createContext(50, 99);
    const offHandle = { ...createContext(10, 50), refs: onHandle.refs };

    // action
    resolveProgressiveBlurHover(onHandle);

    // result
    expect(onHandle.refs.progressiveBlur.hoveredEndpointRef.current).toBe('end');

    // action
    resolveProgressiveBlurHover(offHandle);

    // result
    expect(onHandle.refs.progressiveBlur.hoveredEndpointRef.current).toBeNull();
  });
});
