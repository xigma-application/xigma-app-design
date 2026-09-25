import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LineEndpoint, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TLineNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { isLineNode } from 'utils/canvas/line/isLineNode';
import { clampStrokeWeight } from '../../../Common/StrokeSection/StrokeSettingsRow/utils/clampStrokeWeight';
import { getSharedValue } from '../../../Common/StrokeSection/StrokeSettingsRow/utils/getSharedValue';
import { handleLineWeightBlur } from './utils/handleLineWeightBlur';

export type TUseLineStrokeSettingsResult = {
  endPoint: LineEndpoint | undefined;
  isBrush: boolean;
  isNonBasicMode: boolean;
  isStrokeModeMixed: boolean;
  isWeightMixed: boolean;
  onEndPointSelect: TFunc<[LineEndpoint]>;
  onPositionSelect: TFunc<[StrokeAlign]>;
  onStartPointSelect: TFunc<[LineEndpoint]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  position: StrokeAlign | undefined;
  startPoint: LineEndpoint | undefined;
  weight: number;
};

export const useLineStrokeSettings = (): TUseLineStrokeSettingsResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isLineNode);
  const weights = nodes.map((node) => node.strokeWidth ?? 1);
  const weight = weights[0] ?? 1;
  const sharedWeight = getSharedValue(weights);
  const modes = nodes.map((node) => node.strokeMode ?? StrokeMode.basic);
  const position = getSharedValue(nodes.map((node) => node.strokeAlign ?? StrokeAlign.center));

  const commitEach = (getChanges: TFunc<[TLineNode], TSceneNodeChanges>): void => {
    dispatch(updateNodes(nodes.map((node) => ({ changes: getChanges(node), id: node.id }))));
  };

  const commitEachWithHistory = (getChanges: TFunc<[TLineNode], TSceneNodeChanges>): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commitEach(getChanges);
    dispatch(endHistoryGesture());
  };

  return {
    endPoint: getSharedValue(nodes.map((node) => node.endPoint ?? LineEndpoint.none)),
    isBrush: modes.length > 0 && modes.every((mode) => mode === StrokeMode.brush),
    isNonBasicMode: modes.some((mode) => mode !== StrokeMode.basic),
    isStrokeModeMixed: getSharedValue(modes) === undefined,
    isWeightMixed: sharedWeight === undefined,
    onEndPointSelect: (endPoint) => commitEachWithHistory(() => ({ endPoint })),
    onPositionSelect: (strokeAlign) => commitEachWithHistory(() => ({ strokeAlign })),
    onStartPointSelect: (startPoint) => commitEachWithHistory(() => ({ startPoint })),
    onWeightBlur: (event) => handleLineWeightBlur(event, sharedWeight, (strokeWidth) => commitEachWithHistory(() => ({ strokeWidth }))),
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: (value) => commitEach((node) => ({ strokeWidth: clampStrokeWeight((node.strokeWidth ?? 1) + value - weight) })),
    position,
    startPoint: getSharedValue(nodes.map((node) => node.startPoint ?? LineEndpoint.none)),
    weight,
  };
};
