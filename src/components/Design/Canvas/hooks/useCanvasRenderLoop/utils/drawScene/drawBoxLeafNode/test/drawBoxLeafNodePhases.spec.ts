// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxLeafNode } from '../drawBoxLeafNode';

const calls: string[] = [];

vi.mock('../drawBoxLeafNodeNoise', () => ({ drawBoxLeafNodeNoise: (): number => calls.push('noise') }));
vi.mock('../drawBoxLeafNodeFill', () => ({ drawBoxLeafNodeFill: (): number => calls.push('fill') }));
vi.mock('../drawBoxLeafNodeStroke', () => ({ drawBoxLeafNodeStroke: (): number => calls.push('stroke') }));
vi.mock('../drawBoxLeafNodeStrokePaints', () => ({ drawBoxLeafNodeStrokePaints: (): number => calls.push('strokePaints') }));

const context = {} as TDrawSceneContext;
const refs = createCanvasRefs();
const rectangle: TRectangleNode = {
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
const section: TSectionNode = {
  childIds: [],
  fill: '#abc',
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

describe('drawBoxLeafNode phases', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('should draw the noise over the stroke, after the children, not with the fill', () => {
    // action
    drawBoxLeafNode(context, rectangle, 1, {}, new Map(), refs, null, 0, 'fill');
    drawBoxLeafNode(context, rectangle, 1, {}, new Map(), refs, null, 0, 'stroke');

    // result
    expect(calls).toEqual(['fill', 'stroke', 'strokePaints', 'noise']);
  });

  it('should draw fill, stroke and then the noise in order for the all-in-one phase', () => {
    // action
    drawBoxLeafNode(context, rectangle, 1, {}, new Map(), refs, null);

    // result
    expect(calls).toEqual(['fill', 'stroke', 'strokePaints', 'noise']);
  });

  it('should leave the noise decision to drawBoxLeafNodeNoise for every box node, including a section', () => {
    // action
    drawBoxLeafNode(context, section, 1, {}, new Map(), refs, null);

    // result
    expect(calls).toEqual(['fill', 'stroke', 'strokePaints', 'noise']);
  });
});
