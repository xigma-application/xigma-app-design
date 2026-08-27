// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorFillColorForLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillColorForLoopKey';
import { subtractCapsuleFromVectorNetwork } from 'utils/canvas/vectorNetwork/eraseVectorNetwork/subtractCapsuleFromVectorNetwork/subtractCapsuleFromVectorNetwork';

export const getErasePreviewNodes = (
  nodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  activeTool: ToolName,
  refs: TCanvasRefs,
  viewport: TViewport,
): TSceneNode[] => {
  const strokePath = refs.vectorEraseStrokeRef.current;

  if (activeTool !== ToolName.erase || !strokePath || strokePath.length === 0 || vectorEditingNodeIds.length === 0) {
    return nodes;
  }

  const radius = refs.eraserDiameterRef.current / 2 / viewport.zoom;

  return nodes.map((node) => {
    if (node.type !== NodeType.vector || !vectorEditingNodeIds.includes(node.id)) {
      return node;
    }

    const bakedNode = getRenderedVectorNode(node);
    const erased = subtractCapsuleFromVectorNetwork(bakedNode, strokePath, radius);

    if (!erased) {
      return node;
    }

    const fillColorOverrideByKey = Object.fromEntries(
      erased.survivingFaces.map(({ key, originalKey }) => [key, getVectorFillColorForLoopKey(originalKey)]),
    );

    return { ...bakedNode, ...erased, fillColorOverrideByKey };
  });
};
