import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeAlign, StrokeSides } from 'types/design/enums';
import { isAppearanceNode } from '../../../AppearanceSection/types';
import { TStrokeSide, TStrokeSideWidths } from 'utils/design/stroke/types';

// utils
import { getStrokeSideWidthChange } from 'utils/design/stroke/getStrokeSideWidthChange';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';
import { getStrokeSidesChange } from 'utils/design/stroke/getStrokeSidesChange';
import { getStrokeWeightChange } from 'utils/design/stroke/getStrokeWeightChange';
import { getStrokeWeightDisplay } from 'utils/design/stroke/getStrokeWeightDisplay';
import { parseStrokeWeight } from '../utils/parseStrokeWeight';

export type TUseStrokeSettingsRowResult = {
  isWeightMixed: boolean;
  onPositionSelect: TFunc<[StrokeAlign]>;
  onSideBlur: (side: TStrokeSide) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onSideScrub: (side: TStrokeSide) => TFunc<[number]>;
  onSidesSelect: TFunc<[StrokeSides]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  position: StrokeAlign;
  sideWeights: TStrokeSideWidths;
  sides: StrokeSides;
  weight: number;
};

export const useStrokeSettingsRow = (): TUseStrokeSettingsRowResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const weight = node?.strokeWidth ?? 1;
  const weightDisplay = node ? getStrokeWeightDisplay(node) : weight;
  const position = node?.strokeAlign ?? StrokeAlign.inside;
  const sides = node?.strokeSides ?? StrokeSides.all;
  const sideWeights = node ? getStrokeSideWidths(node) : { bottom: 0, left: 0, right: 0, top: 0 };

  const commit = (changes: Parameters<typeof updateNode>[0]['changes']): void => {
    if (node) {
      dispatch(updateNode({ changes, id: node.id }));
    }
  };

  const commitWithHistory = (changes: Parameters<typeof updateNode>[0]['changes']): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commit(changes);
    dispatch(endHistoryGesture());
  };

  const onPositionSelect = (strokeAlign: StrokeAlign): void => {
    if (node && strokeAlign !== position) {
      commitWithHistory({ strokeAlign });
    }
  };

  const onSidesSelect = (nextSides: StrokeSides): void => {
    if (node && nextSides !== sides) {
      commitWithHistory(getStrokeSidesChange(node, nextSides));
    }
  };

  const onWeightBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = parseStrokeWeight(event.target.value);

    if (node && parsed !== null && (parsed !== weightDisplay || weightDisplay === null)) {
      commitWithHistory(getStrokeWeightChange(node, parsed));
    } else {
      event.target.value = event.target.defaultValue;
    }
  };

  const onSideBlur =
    (side: TStrokeSide) =>
    (event: FocusEvent<HTMLInputElement>): void => {
      const parsed = parseStrokeWeight(event.target.value);

      if (node && parsed !== null && parsed !== sideWeights[side]) {
        commitWithHistory(getStrokeSideWidthChange(node, side, parsed));
      } else {
        event.target.value = event.target.defaultValue;
      }
    };

  return {
    isWeightMixed: weightDisplay === null,
    onPositionSelect,
    onSideBlur,
    onSideScrub: (side) => (value) => commit(node ? getStrokeSideWidthChange(node, side, value) : {}),
    onSidesSelect,
    onWeightBlur,
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: (value) => commit(node ? getStrokeWeightChange(node, value) : {}),
    position,
    sideWeights,
    sides,
    weight,
  };
};
