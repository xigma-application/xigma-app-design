// types
import { NodeType } from 'types/design/enums';
import { TNodeMenuFlags } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { canOutlineNodeStroke } from './canOutlineNodeStroke';
import { canConvertToSection } from 'store/design/utils/nodeHierarchy/canConvertToSection';
import { getIsMaskChild } from 'store/design/utils/getIsMaskChild';
import { isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

export const getNodeMenuFlags = (nodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TNodeMenuFlags => {
  const isTextOnPath = (node: TSceneNode): boolean => node.type === NodeType.text && Boolean(node.pathId);
  const isFrameOrSection = (node: TSceneNode): boolean => node.type === NodeType.frame || node.type === NodeType.section;
  const isMaskRelated = (node: TSceneNode): boolean => node.type === NodeType.mask || getIsMaskChild(node, nodesById);
  const hasFrameOrSection = nodes.some(isFrameOrSection);
  const hasSlice = nodes.some((node) => node.type === NodeType.slice);

  return {
    canConvertToSection: nodes.every((node) => node.type === NodeType.frame) && canConvertToSection(nodes, nodesById),
    canFlatten: nodes.every((node) => isConvertibleToVectorNode(node) || node.type === NodeType.text),
    canOutlineStroke: nodes.every(canOutlineNodeStroke),
    canUngroup: nodes.every((node) => node.type === NodeType.group),
    hasSection: nodes.some((node) => node.type === NodeType.section),
    hasSlice,
    hasTextOnPath: nodes.some(isTextOnPath),
    isContainerSelection: nodes.every((node) => isFrameOrSection(node) || node.type === NodeType.group),
    isFrameOrGroupSelection: nodes.every((node) => node.type === NodeType.frame || node.type === NodeType.group),
    isFrameOrSectionSelection: nodes.every(isFrameOrSection),
    isSectionSelection: nodes.every((node) => node.type === NodeType.section),
    isTextOnPathSelection: nodes.every(isTextOnPath),
    withFlatten: !hasFrameOrSection && !hasSlice,
    withFlip: !hasFrameOrSection,
    withRemoveMask: !hasFrameOrSection && nodes.every(isMaskRelated),
    withUseAsMask: !hasFrameOrSection && !hasSlice && !nodes.some(isMaskRelated),
  };
};
