// types
import { EffectType, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawBoxLeafNodeNoise } from '../drawBoxLeafNodeNoise';

const drawBoxEffectsMock = vi.fn();

vi.mock('../drawBoxEffects', () => ({ drawBoxEffects: (...args: unknown[]): void => drawBoxEffectsMock(...args) }));

const context = {} as TDrawSceneContext;
const refs = {} as TCanvasRefs;

describe('drawBoxLeafNodeNoise', () => {
  beforeEach(() => {
    drawBoxEffectsMock.mockClear();
  });

  it('should draw the noise effects of a node that has fills', () => {
    // mock
    const node: TRectangleNode = {
      fills: [],
      height: 40,
      id: 'r1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 60,
      x: 0,
      y: 0,
    };

    // action
    drawBoxLeafNodeNoise(context, node, 0.5, refs);

    // result
    expect(drawBoxEffectsMock).toHaveBeenCalledWith(context, node, 0.5, refs, EffectType.noise);
  });

  it('should draw the noise effects of a section too, since it has fills like a frame', () => {
    // mock
    const section: TSectionNode = {
      childIds: [],
      fills: [{ color: '#abc', opacity: 100, type: 'solid' }],
      height: 40,
      id: 's1',
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 60,
      x: 0,
      y: 0,
    };

    // action
    drawBoxLeafNodeNoise(context, section, 1, refs);

    // result
    expect(drawBoxEffectsMock).toHaveBeenCalledWith(context, section, 1, refs, EffectType.noise);
  });
});
