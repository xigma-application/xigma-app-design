// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getNestedSectionLabelHit } from '../getNestedSectionLabelHit';
import { getSectionNameLabelRects } from '../../../../../../utils/getSectionNameLabelRects';

const makeSection = (overrides: Partial<TSectionNode>): TSectionNode => ({
  childIds: [],
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
  height: 300,
  id: 'section',
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

const outer = makeSection({ childIds: ['inner'], height: 1000, id: 'outer', width: 1000 });
const inner = makeSection({ childIds: ['child'], id: 'inner', parentId: 'outer', x: 100, y: 100 });
const child: TRectangleNode = {
  fills: [],
  height: 100,
  id: 'child',
  name: 'child',
  parentId: 'inner',
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 100,
  y: 100,
};
const other = makeSection({ id: 'other', x: 2000, y: 2000 });
const nodesById: Record<string, TSceneNode> = { child, inner, other, outer };
const renderOrderedNodes = [outer, inner, child, other];
const zoom = 1;

const getLabelCenter = (section: TSectionNode, byId: Record<string, TSceneNode>): { x: number; y: number } => {
  const [rect] = getSectionNameLabelRects([section], zoom, byId);

  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
};

describe('getNestedSectionLabelHit', () => {
  it('should return the section inside the frame whose name label is under the pointer', () => {
    // before
    const hit = getNestedSectionLabelHit(outer, getLabelCenter(inner, nodesById), zoom, renderOrderedNodes, nodesById);

    // result
    expect(hit).toBe(inner);
  });

  it('should ignore the pointer off every label, and a hidden, locked or outside section', () => {
    // mock
    const hidden = { ...inner, hidden: true };
    const locked = { ...inner, locked: true };

    // result
    expect(getNestedSectionLabelHit(outer, { x: 350, y: 350 }, zoom, renderOrderedNodes, nodesById)).toBeNull();
    expect(
      getNestedSectionLabelHit(outer, getLabelCenter(inner, nodesById), zoom, [outer, hidden], { ...nodesById, inner: hidden }),
    ).toBeNull();
    expect(
      getNestedSectionLabelHit(outer, getLabelCenter(inner, nodesById), zoom, [outer, locked], { ...nodesById, inner: locked }),
    ).toBeNull();
    expect(getNestedSectionLabelHit(outer, getLabelCenter(other, nodesById), zoom, renderOrderedNodes, nodesById)).toBeNull();
  });
});
