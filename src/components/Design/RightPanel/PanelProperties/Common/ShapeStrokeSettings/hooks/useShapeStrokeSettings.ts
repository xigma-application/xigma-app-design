import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TSceneNodeChanges } from 'types/design/types';
import { TShapeStrokeNode, TShapeStrokeNodeType } from '../../types';

// utils
import { clampStrokeWeight } from '../../StrokeSection/StrokeSettingsRow/utils/clampStrokeWeight';
import { getSharedValue } from '../../StrokeSection/StrokeSettingsRow/utils/getSharedValue';
import { handleLineWeightBlur } from '../../../Line/LineStrokeSettings/hooks/utils/handleLineWeightBlur';

export type TUseShapeStrokeSettingsResult = {
  isNonBasicMode: boolean;
  isStrokeModeMixed: boolean;
  isWeightMixed: boolean;
  onPositionSelect: TFunc<[StrokeAlign]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  position: StrokeAlign | undefined;
  weight: number;
};

export const useShapeStrokeSettings = (type: TShapeStrokeNodeType): TUseShapeStrokeSettingsResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TShapeStrokeNode => node?.type === type);
  const defaultPosition = type === NodeType.vector ? StrokeAlign.center : StrokeAlign.inside;
  const weights = nodes.map((node) => node.strokeWidth ?? 1);
  const weight = weights[0] ?? 1;
  const sharedWeight = getSharedValue(weights);
  const modes = nodes.map((node) => node.strokeMode ?? StrokeMode.basic);

  const commitEach = (getChanges: TFunc<[TShapeStrokeNode], TSceneNodeChanges>): void => {
    dispatch(updateNodes(nodes.map((node) => ({ changes: getChanges(node), id: node.id }))));
  };

  const commitEachWithHistory = (getChanges: TFunc<[TShapeStrokeNode], TSceneNodeChanges>): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commitEach(getChanges);
    dispatch(endHistoryGesture());
  };

  return {
    isNonBasicMode: modes.some((mode) => mode !== StrokeMode.basic),
    isStrokeModeMixed: getSharedValue(modes) === undefined,
    isWeightMixed: sharedWeight === undefined,
    onPositionSelect: (strokeAlign) => commitEachWithHistory(() => ({ strokeAlign })),
    onWeightBlur: (event) => handleLineWeightBlur(event, sharedWeight, (strokeWidth) => commitEachWithHistory(() => ({ strokeWidth }))),
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: (value) => commitEach((node) => ({ strokeWidth: clampStrokeWeight((node.strokeWidth ?? 1) + value - weight) })),
    position: getSharedValue(nodes.map((node) => node.strokeAlign ?? defaultPosition)),
    weight,
  };
};
