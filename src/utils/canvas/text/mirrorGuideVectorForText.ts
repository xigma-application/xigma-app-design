// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode, TVectorNode, TVectorTangent } from 'types/design/types';

const flipTangent = (tangent: TVectorTangent, flipX: boolean, flipY: boolean): TVectorTangent =>
  tangent ? { x: flipX ? -tangent.x : tangent.x, y: flipY ? -tangent.y : tangent.y } : null;

export const mirrorGuideVectorForText = (vectorNode: TVectorNode, nodesById: Record<string, TSceneNode>): TVectorNode => {
  const boundText = Object.values(nodesById).find(
    (node): node is TTextNode => node.type === NodeType.text && node.pathId === vectorNode.id,
  );
  const flipX = boundText?.flipX ?? false;
  const flipY = boundText?.flipY ?? false;

  if (!boundText || (!flipX && !flipY)) {
    return vectorNode;
  }

  const centerX = boundText.x + boundText.width / 2;
  const centerY = boundText.y + boundText.height / 2;

  return {
    ...vectorNode,
    segments: Object.fromEntries(
      Object.entries(vectorNode.segments).map(([id, segment]) => [
        id,
        {
          ...segment,
          tangentEnd: flipTangent(segment.tangentEnd, flipX, flipY),
          tangentStart: flipTangent(segment.tangentStart, flipX, flipY),
        },
      ]),
    ),
    vertices: Object.fromEntries(
      Object.entries(vectorNode.vertices).map(([id, vertex]) => [
        id,
        { ...vertex, x: flipX ? 2 * centerX - vertex.x : vertex.x, y: flipY ? 2 * centerY - vertex.y : vertex.y },
      ]),
    ),
  };
};
