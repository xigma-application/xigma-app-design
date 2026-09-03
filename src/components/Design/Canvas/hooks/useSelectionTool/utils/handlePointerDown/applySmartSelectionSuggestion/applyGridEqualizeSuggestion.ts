// store
import { updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSmartSelectionGridEqualizeSuggestion, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { computeSmartSelectionCascadeDeltas } from '../../../../../utils/applySmartSelectionGapCascade';
import { getDragNodeOrigins } from '../armDrag/getDragNodeOrigins';
import { getGeometryDeltaChanges } from '../../../../../utils/getGeometryDeltaChanges';
import { getSmartSelectionCascadeGroups } from '../../../../../utils/getSmartSelectionCascadeGroups';

export const applyGridEqualizeSuggestion = (dispatch: AppDispatch, suggestion: TSmartSelectionGridEqualizeSuggestion): void => {
  const nodes = selectNodes(store.getState());
  const columnCascade = getSmartSelectionCascadeGroups(suggestion.layout, 'x');
  const rowCascade = getSmartSelectionCascadeGroups(suggestion.layout, 'y');
  const meanColumnGap = suggestion.columnGapValues.reduce((sum, value) => sum + value, 0) / suggestion.columnGapValues.length;
  const meanRowGap = suggestion.rowGapValues.reduce((sum, value) => sum + value, 0) / suggestion.rowGapValues.length;
  const columnDeltas = computeSmartSelectionCascadeDeltas(columnCascade, meanColumnGap);
  const rowDeltas = computeSmartSelectionCascadeDeltas(rowCascade, meanRowGap);
  const cellIds = suggestion.layout.cells
    .flat()
    .filter((cell): cell is TSmartSelectionNode => cell !== null)
    .map((cell) => cell.id);
  const nodeOrigins = getDragNodeOrigins(cellIds, nodes);

  cellIds.forEach((id) => {
    dispatch(updateNode({ changes: getGeometryDeltaChanges(nodeOrigins[id], columnDeltas[id] ?? 0, rowDeltas[id] ?? 0), id }));
  });
};
