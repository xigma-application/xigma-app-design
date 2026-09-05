// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getAlreadyVectorNodeIds } from '../getAlreadyVectorNodeIds';

const vector = (id: string): TSceneNode =>
  ({
    defaultFill: null,
    filledFaceKeys: [],
    id,
    name: id,
    parentId: null,
    rotation: 0,
    segments: {},
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: {},
  }) as TSceneNode;

const rect = (id: string): TSceneNode =>
  ({
    fill: '#000000',
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const textOnPath = (id: string, pathId: string): TSceneNode =>
  ({
    content: 'Hi',
    fill: '#ffffff',
    flipX: false,
    flipY: false,
    fontFamily: 'Inter',
    fontSize: 14,
    height: 40,
    id,
    name: id,
    parentId: null,
    pathId,
    rotation: 0,
    type: NodeType.text,
    width: 200,
    x: 0,
    y: 0,
  }) as TSceneNode;

const byId = (...nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getAlreadyVectorNodeIds', () => {
  it("should include a plain vector node's id", () => {
    const v1 = vector('v1');

    expect(getAlreadyVectorNodeIds([v1], byId(v1))).toEqual(['v1']);
  });

  it('should exclude a non-vector node entirely', () => {
    const r1 = rect('r1');

    expect(getAlreadyVectorNodeIds([r1], byId(r1))).toEqual([]);
  });

  it('should exclude a vector node currently bound as a text-on-path guide', () => {
    const v1 = vector('v1');
    const t1 = textOnPath('t1', 'v1');

    expect(getAlreadyVectorNodeIds([v1], byId(v1, t1))).toEqual([]);
  });

  it('should preserve selection order across a mixed selection', () => {
    const v1 = vector('v1');
    const v2 = vector('v2');
    const r1 = rect('r1');

    expect(getAlreadyVectorNodeIds([v2, r1, v1], byId(v1, v2, r1))).toEqual(['v2', 'v1']);
  });
});
