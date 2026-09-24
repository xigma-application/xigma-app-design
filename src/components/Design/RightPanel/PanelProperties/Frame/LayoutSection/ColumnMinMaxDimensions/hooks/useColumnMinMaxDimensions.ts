import { useTranslation } from 'react-i18next';

// hooks
import { useAppDispatch, useAppSelector } from 'store';

// others
import { translationNameSpace } from '../constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectRevealedMinMax, selectSelectedNodes } from 'store/design/selectors';
import { setMinMaxRevealed, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

// utils
import { getMinMaxBoundChanges } from './utils/getMinMaxBoundChanges';
import { getMixedOrValue } from 'components/Design/RightPanel/PanelProperties/Common/utils/getMixedOrValue';

export type TUseColumnMinMaxDimensionsResult = {
  disabledMaxHeight: boolean;
  disabledMaxWidth: boolean;
  disabledMinHeight: boolean;
  disabledMinWidth: boolean;
  displayMaxHeight: number | string | undefined;
  displayMaxWidth: number | string | undefined;
  displayMinHeight: number | string | undefined;
  displayMinWidth: number | string | undefined;
  hasMaxHeight: boolean;
  hasMaxWidth: boolean;
  hasMinHeight: boolean;
  hasMinWidth: boolean;
  maxHeight: number | undefined;
  maxWidth: number | undefined;
  minHeight: number | undefined;
  minWidth: number | undefined;
  onBlurCommitMaxHeight: TFunc<[number]>;
  onBlurCommitMaxWidth: TFunc<[number]>;
  onBlurCommitMinHeight: TFunc<[number]>;
  onBlurCommitMinWidth: TFunc<[number]>;
  onCommitMaxHeight: TFunc<[number]>;
  onCommitMaxWidth: TFunc<[number]>;
  onCommitMinHeight: TFunc<[number]>;
  onCommitMinWidth: TFunc<[number]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
};

const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;

export const useColumnMinMaxDimensions = (): TUseColumnMinMaxDimensionsResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  const revealed = useAppSelector(selectRevealedMinMax);
  const [frameNode] = frames;
  const isFrame = frameNode !== undefined;
  const mixedLabel = t(`${translationNameSpace}.mixed`);

  const getDisplayValue = (bound: keyof TRevealedMinMax): number | string | undefined => {
    const mixedOrValue = frames.length > 1 ? getMixedOrValue(frames.map((frame) => frame[bound] ?? 0)) : frameNode?.[bound];
    return mixedOrValue === 'mixed' ? mixedLabel : mixedOrValue;
  };

  const isPartlySet = (bound: keyof TRevealedMinMax): boolean =>
    frames.some((frame) => frame[bound] !== undefined) && frames.some((frame) => frame[bound] === undefined);

  const commitBound = (bound: keyof TRevealedMinMax, value: number): void => {
    frames.forEach((frame) => dispatch(updateNode({ changes: getMinMaxBoundChanges(frame, bound, value), id: frame.id })));

    if (value <= 0) {
      dispatch(setMinMaxRevealed({ bound, value: false }));
    }
  };

  const commitBoundOnBlur =
    (bound: keyof TRevealedMinMax): TFunc<[number]> =>
    (value): void => {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      commitBound(bound, value);
      dispatch(endHistoryGesture());
    };

  return {
    disabledMaxHeight: isPartlySet('maxHeight'),
    disabledMaxWidth: isPartlySet('maxWidth'),
    disabledMinHeight: isPartlySet('minHeight'),
    disabledMinWidth: isPartlySet('minWidth'),
    displayMaxHeight: getDisplayValue('maxHeight'),
    displayMaxWidth: getDisplayValue('maxWidth'),
    displayMinHeight: getDisplayValue('minHeight'),
    displayMinWidth: getDisplayValue('minWidth'),
    hasMaxHeight: isFrame && revealed.maxHeight,
    hasMaxWidth: isFrame && revealed.maxWidth,
    hasMinHeight: isFrame && revealed.minHeight,
    hasMinWidth: isFrame && revealed.minWidth,
    maxHeight: frameNode?.maxHeight,
    maxWidth: frameNode?.maxWidth,
    minHeight: frameNode?.minHeight,
    minWidth: frameNode?.minWidth,
    onBlurCommitMaxHeight: commitBoundOnBlur('maxHeight'),
    onBlurCommitMaxWidth: commitBoundOnBlur('maxWidth'),
    onBlurCommitMinHeight: commitBoundOnBlur('minHeight'),
    onBlurCommitMinWidth: commitBoundOnBlur('minWidth'),
    onCommitMaxHeight: (value) => commitBound('maxHeight', value),
    onCommitMaxWidth: (value) => commitBound('maxWidth', value),
    onCommitMinHeight: (value) => commitBound('minHeight', value),
    onCommitMinWidth: (value) => commitBound('minWidth', value),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
  };
};
