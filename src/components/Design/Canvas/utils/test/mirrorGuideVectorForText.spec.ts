// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { mirrorGuideVectorForText } from '../mirrorGuideVectorForText';

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vec-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 40 } },
  ...overrides,
});

const buildText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'vec-1',
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const byId = (...nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('mirrorGuideVectorForText', () => {
  it('should return the vector untouched when no text is bound to it', () => {
    const vector = buildVector();

    expect(mirrorGuideVectorForText(vector, byId(vector))).toBe(vector);
  });

  it('should return the vector untouched when the bound text has no flip', () => {
    const vector = buildVector();
    const text = buildText({ flipX: false, flipY: false });

    expect(mirrorGuideVectorForText(vector, byId(vector, text))).toBe(vector);
  });

  it('should mirror every vertex about the text box centre X when the text is flipped horizontally', () => {
    // box x 0..100 -> centre X 50; flipX maps x -> 100 - x
    const vector = buildVector();
    const text = buildText({ flipX: true });

    const mirrored = mirrorGuideVectorForText(vector, byId(vector, text));

    expect(mirrored.vertices).toEqual({ a: { id: 'a', x: 100, y: 0 }, b: { id: 'b', x: 0, y: 40 } });
  });

  it('should mirror every vertex about the text box centre Y when the text is flipped vertically', () => {
    // box y 0..40 -> centre Y 20; flipY maps y -> 40 - y
    const vector = buildVector();
    const text = buildText({ flipY: true });

    const mirrored = mirrorGuideVectorForText(vector, byId(vector, text));

    expect(mirrored.vertices).toEqual({ a: { id: 'a', x: 0, y: 40 }, b: { id: 'b', x: 100, y: 0 } });
  });

  it('should negate the matching tangent component for each flipped axis', () => {
    const vector = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: -8, y: -3 }, tangentStart: { x: 8, y: 3 } },
      },
    });
    const text = buildText({ flipX: true, flipY: true });

    const mirrored = mirrorGuideVectorForText(vector, byId(vector, text));

    expect(mirrored.segments.s1).toMatchObject({ tangentEnd: { x: 8, y: 3 }, tangentStart: { x: -8, y: -3 } });
  });

  it('should leave a null tangent as null', () => {
    const vector = buildVector();
    const text = buildText({ flipX: true });

    expect(mirrorGuideVectorForText(vector, byId(vector, text)).segments.s1.tangentStart).toBeNull();
  });
});
