// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';

const box = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };

export const frame = (id: string, name: string, parentId: string | null, childIds: string[] = []): TFrameNode => ({
  ...box,
  childIds,
  clipContent: false,
  fills: [],
  id,
  name,
  parentId,
  type: NodeType.frame,
});

export const rect = (id: string, name: string, parentId: string | null): TRectangleNode => ({
  ...box,
  fills: [],
  id,
  name,
  parentId,
  type: NodeType.rectangle,
});

export const section = (id: string, name: string, childIds: string[]): TSectionNode => ({
  ...box,
  childIds,
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  id,
  name,
  parentId: null,
  type: NodeType.section,
});

export const matchingNodes: TSceneNode[] = [
  frame('screenA', 'Screen A', null, ['headerA', 'cardA1', 'cardA2']),
  frame('headerA', 'Header', 'screenA', ['titleA']),
  rect('titleA', 'Title', 'headerA'),
  rect('cardA1', 'Card', 'screenA'),
  rect('cardA2', 'Card', 'screenA'),
  frame('screenB', 'Screen B', null, ['headerB', 'cardB1']),
  frame('headerB', 'Header', 'screenB', ['titleB']),
  rect('titleB', 'Title', 'headerB'),
  rect('cardB1', 'Card', 'screenB'),
  frame('screenC', 'Screen C', null, ['titleC']),
  rect('titleC', 'Title', 'screenC'),
  rect('loose', 'Loose', null),
  section('sectionS', 'Section', ['screenD', 'screenE']),
  frame('screenD', 'Screen D', 'sectionS', ['headerD']),
  frame('headerD', 'Header', 'screenD', ['titleD']),
  rect('titleD', 'Title', 'headerD'),
  frame('screenE', 'Screen E', 'sectionS', ['headerE']),
  frame('headerE', 'Header', 'screenE', ['titleE']),
  rect('titleE', 'Title', 'headerE'),
];

export const matchingRootOrder = ['screenA', 'screenB', 'screenC', 'loose', 'sectionS'];

export const matchingNodesById: Record<string, TSceneNode> = Object.fromEntries(matchingNodes.map((node) => [node.id, node]));
