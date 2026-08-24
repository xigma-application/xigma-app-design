// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TVectorWidthHandleSelection, TVectorWidthPointDragGroupTarget } from 'types/design/canvas/types';

export type TVectorWidthPointGroupDrag = {
  groupTargets: TVectorWidthPointDragGroupTarget[];
  selection: TVectorWidthHandleSelection[];
};

const isSameRegulator = (selected: TVectorWidthHandleSelection, nodeId: string, pointId: string): boolean =>
  selected.nodeId === nodeId && selected.pointId === pointId;

const toGroupTarget = (
  nodes: Record<string, TSceneNode>,
  regulator: TVectorWidthHandleSelection,
): TVectorWidthPointDragGroupTarget | null => {
  const node = nodes[regulator.nodeId];
  const targetPoint = node?.type === NodeType.vector ? node.widthProfile?.points[regulator.pointId] : undefined;

  return targetPoint ? { nodeId: regulator.nodeId, point: { ...targetPoint } } : null;
};

export const getVectorWidthPointGroupDragTargets = (
  currentSelection: TVectorWidthHandleSelection[],
  nodes: Record<string, TSceneNode>,
  nodeId: string,
  pointId: string,
): TVectorWidthPointGroupDrag => {
  const selectedRegulators = currentSelection.filter((selected) => selected.side === 'point');
  const isAlreadySelected = selectedRegulators.some((regulator) => isSameRegulator(regulator, nodeId, pointId));
  const regulators = isAlreadySelected ? selectedRegulators : [{ nodeId, pointId, side: 'point' as const }];

  return {
    groupTargets: regulators
      .filter((regulator) => !isSameRegulator(regulator, nodeId, pointId))
      .map((regulator) => toGroupTarget(nodes, regulator))
      .filter((target): target is TVectorWidthPointDragGroupTarget => target !== null),
    selection: regulators.flatMap((regulator) => [
      { nodeId: regulator.nodeId, pointId: regulator.pointId, side: 'left' as const },
      { nodeId: regulator.nodeId, pointId: regulator.pointId, side: 'right' as const },
      { nodeId: regulator.nodeId, pointId: regulator.pointId, side: 'point' as const },
    ]),
  };
};
