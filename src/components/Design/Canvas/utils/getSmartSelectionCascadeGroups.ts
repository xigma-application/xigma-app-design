// types
import { TSmartSelectionCascadeGroup } from 'types/design/canvas/types';
import { TGridGeometry, TSmartSelectionGridLayout, TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from './getSmartSelectionLayout/getGridCellRect';

export type TSmartSelectionCascadeSetup = {
  anchorPosition: number;
  anchorSize: number;
  cascadeGroups: TSmartSelectionCascadeGroup[];
};

const getSizeKey = (axis: 'x' | 'y'): 'height' | 'width' => (axis === 'x' ? 'width' : 'height');

const buildFromNodes = (nodes: TSmartSelectionNode[], axis: 'x' | 'y'): TSmartSelectionCascadeSetup => {
  const sizeKey = getSizeKey(axis);
  const [anchor, ...rest] = nodes;

  return {
    anchorPosition: anchor.bounds[axis],
    anchorSize: anchor.bounds[sizeKey],
    cascadeGroups: rest.map((node) => ({ nodeIds: [node.id], originalPosition: node.bounds[axis], size: node.bounds[sizeKey] })),
  };
};

const buildFromGridAxis = (
  cells: TSmartSelectionGridLayout['cells'],
  geometry: TGridGeometry,
  crossCount: number,
  axis: 'x' | 'y',
): TSmartSelectionCascadeSetup => {
  const sizeKey = getSizeKey(axis);
  const getGroupNodeIds = (index: number): string[] =>
    (axis === 'x' ? cells.map((row) => row[index]) : cells[index])
      .filter((cell): cell is TSmartSelectionNode => cell !== null)
      .map((cell) => cell.id);
  const getRepresentativeBounds = (index: number): TSmartSelectionNode['bounds'] =>
    axis === 'x' ? getGridCellRect(geometry, 0, index) : getGridCellRect(geometry, index, 0);
  const anchorBounds = getRepresentativeBounds(0);
  const cascadeGroups: TSmartSelectionCascadeGroup[] = [];

  for (let index = 1; index < crossCount; index += 1) {
    const bounds = getRepresentativeBounds(index);

    cascadeGroups.push({ nodeIds: getGroupNodeIds(index), originalPosition: bounds[axis], size: bounds[sizeKey] });
  }

  return { anchorPosition: anchorBounds[axis], anchorSize: anchorBounds[sizeKey], cascadeGroups };
};

export const getSmartSelectionCascadeGroups = (layout: TSmartSelectionLayout, axis: 'x' | 'y'): TSmartSelectionCascadeSetup => {
  if (layout.type === 'grid') {
    return buildFromGridAxis(layout.cells, layout.geometry, axis === 'x' ? layout.columnCount : layout.rowCount, axis);
  }

  return buildFromNodes(layout.nodes, axis);
};
