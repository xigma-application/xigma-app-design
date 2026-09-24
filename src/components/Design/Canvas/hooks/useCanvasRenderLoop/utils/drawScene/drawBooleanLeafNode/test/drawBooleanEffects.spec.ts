// types
import { BlendMode, BooleanOperation, EffectType, NodeType } from 'types/design/enums';
import { TBooleanNode } from 'types/design/types';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBooleanEffects } from '../drawBooleanEffects';

const drawMock = vi.fn();

vi.mock('../getBooleanEffectDrawer', () => ({ getBooleanEffectDrawer: (): unknown => drawMock }));

const makeBoolean = (effects: TBooleanNode['effects']): TBooleanNode => ({
  booleanOperation: BooleanOperation.union,
  childIds: [],
  effects,
  fills: [],
  height: 10,
  id: 'union',
  name: 'Union',
  parentId: null,
  rotation: 0,
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
});

describe('drawBooleanEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw every visible effect of the requested type with its blend mode', () => {
    // mock
    const context = {} as TDrawSceneContext;
    const shadow = { ...createEffect(EffectType.dropShadow), blendMode: BlendMode.multiply };
    const node = makeBoolean([shadow, { ...shadow, visible: false }, createEffect(EffectType.noise)]);

    // action
    drawBooleanEffects(context, node, booleanShape, 0.5, createCanvasRefs(), EffectType.dropShadow);

    // result
    expect(drawMock).toHaveBeenCalledTimes(1);
    expect(drawMock).toHaveBeenCalledWith(context, booleanShape, shadow, 0.5, BlendMode.multiply);
  });

  it('should draw nothing for an empty shape', () => {
    // mock
    const node = makeBoolean([createEffect(EffectType.dropShadow)]);

    // action
    drawBooleanEffects({} as TDrawSceneContext, node, { ...booleanShape, polygons: [] }, 1, createCanvasRefs(), EffectType.dropShadow);

    // result
    expect(drawMock).not.toHaveBeenCalled();
  });
});
