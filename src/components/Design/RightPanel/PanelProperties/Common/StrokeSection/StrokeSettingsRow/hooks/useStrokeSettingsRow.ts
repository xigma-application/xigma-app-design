import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeAlign } from 'types/design/enums';
import { isAppearanceNode } from '../../../AppearanceSection/types';

// utils
import { parseStrokeWeight } from '../utils/parseStrokeWeight';

export type TUseStrokeSettingsRowResult = {
  onPositionSelect: TFunc<[StrokeAlign]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  position: StrokeAlign;
  weight: number;
};

export const useStrokeSettingsRow = (): TUseStrokeSettingsRowResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const weight = node?.strokeWidth ?? 1;
  const position = node?.strokeAlign ?? StrokeAlign.inside;

  const commitWeight = (nextWeight: number): void => {
    if (node) {
      dispatch(updateNode({ changes: { strokeWidth: nextWeight }, id: node.id }));
    }
  };

  const onWeightBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = parseStrokeWeight(event.target.value);

    if (parsed === null) {
      event.target.value = `${weight}`;
    } else if (parsed !== weight) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      commitWeight(parsed);
      dispatch(endHistoryGesture());
    } else {
      event.target.value = `${weight}`;
    }
  };

  const onPositionSelect = (strokeAlign: StrokeAlign): void => {
    if (node && strokeAlign !== position) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes: { strokeAlign }, id: node.id }));
      dispatch(endHistoryGesture());
    }
  };

  return {
    onPositionSelect,
    onWeightBlur,
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: commitWeight,
    position,
    weight,
  };
};
