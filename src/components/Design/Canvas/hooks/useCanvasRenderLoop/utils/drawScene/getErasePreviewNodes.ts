// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { subtractCapsuleFromVectorNetwork } from 'utils/canvas/vectorNetwork/eraseVectorNetwork/subtractCapsuleFromVectorNetwork/subtractCapsuleFromVectorNetwork';

export const getErasePreviewNodes = (
  nodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  activeTool: ToolName,
  refs: TCanvasRefs,
  viewport: TViewport,
): TSceneNode[] => {
  const strokePath = refs.vectorErase.vectorEraseStrokeRef.current;

  if (activeTool === ToolName.erase && strokePath && strokePath.length > 0 && vectorEditingNodeIds.length > 0) {
    const radius = refs.vectorErase.eraserDiameterRef.current / 2 / viewport.zoom;

    return nodes.map((node) => {
      if (node.type === NodeType.vector && vectorEditingNodeIds.includes(node.id)) {
        const bakedNode = getRenderedVectorNode(node);
        const erased = subtractCapsuleFromVectorNetwork(bakedNode, strokePath, radius);

        if (erased) {
          return { ...bakedNode, ...erased };
        }
      }

      return node;
    });
  }

  return nodes;
};
