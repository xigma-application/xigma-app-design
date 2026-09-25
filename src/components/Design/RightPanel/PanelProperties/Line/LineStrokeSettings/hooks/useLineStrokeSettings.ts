import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TLineNode, TSceneNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { clampStrokeWeight } from '../../../Common/StrokeSection/StrokeSettingsRow/utils/clampStrokeWeight';
import { getSharedValue } from '../../../Common/StrokeSection/StrokeSettingsRow/utils/getSharedValue';
import { handleLineWeightBlur } from './utils/handleLineWeightBlur';

export type TUseLineStrokeSettingsResult = {
  endPoint: LineEndpoint | undefined;
  isWeightMixed: boolean;
  onEndPointSelect: TFunc<[LineEndpoint]>;
  onStartPointSelect: TFunc<[LineEndpoint]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  startPoint: LineEndpoint | undefined;
  weight: number;
};

export const useLineStrokeSettings = (): TUseLineStrokeSettingsResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(
    (node: TSceneNode | undefined): node is TLineNode => node?.type === NodeType.line,
  );
  const weights = nodes.map((node) => node.strokeWidth ?? 1);
  const weight = weights[0] ?? 1;
  const sharedWeight = getSharedValue(weights);

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
    isWeightMixed: sharedWeight === undefined,
    onEndPointSelect: (endPoint) => commitEachWithHistory(() => ({ endPoint })),
    onStartPointSelect: (startPoint) => commitEachWithHistory(() => ({ startPoint })),
    onWeightBlur: (event) => handleLineWeightBlur(event, sharedWeight, (strokeWidth) => commitEachWithHistory(() => ({ strokeWidth }))),
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: (value) => commitEach((node) => ({ strokeWidth: clampStrokeWeight((node.strokeWidth ?? 1) + value - weight) })),
    startPoint: getSharedValue(nodes.map((node) => node.startPoint ?? LineEndpoint.none)),
    weight,
  };
};
