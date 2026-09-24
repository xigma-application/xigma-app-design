import { useTranslation } from 'react-i18next';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { FLOW_OPTIONS, translationNameSpace } from '../constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

// utils
import { commitFlowChange } from './utils/commitFlowChange';
import { commitGridAutoPlacementFreeze } from 'store/design/utils/autoLayout/gridTracks/commitGridAutoPlacementFreeze';

export type TUseColumnFlowResult = {
  gridAutoPlacement: boolean;
  onChange: TFunc<[string]>;
  onGridAutoPlacementChange: TFunc;
  onWrapChange: TFunc;
  toggleButtons: TToggleButton[];
  value: string;
  wrap: boolean;
};

const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;

export const useColumnFlow = (): TUseColumnFlowResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  const nodes = useAppSelector(selectNodes);
  const modes = frames.map((frame) => frame.layoutMode ?? LayoutMode.freeForm);
  const value = modes.every((mode) => mode === modes[0]) ? (modes[0] ?? LayoutMode.freeForm) : '';
  const wrap = frames.length > 0 && frames.every((frame) => Boolean(frame.layoutWrap));
  const gridAutoPlacement = frames.length === 0 || frames.every((frame) => frame.gridAutoPlacement ?? true);

  const runOnFrames = (apply: TFunc<[TFrameNode]>): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    frames.forEach(apply);
    dispatch(endHistoryGesture());
  };

  const onChange = (nextValue: string): void => runOnFrames((frame) => commitFlowChange(dispatch, frame, nodes, nextValue as LayoutMode));

  const onGridAutoPlacementChange = (): void =>
    runOnFrames((frame) => {
      if (gridAutoPlacement) {
        commitGridAutoPlacementFreeze(dispatch, frame, nodes);
      }

      dispatch(updateNode({ changes: { gridAutoPlacement: !gridAutoPlacement }, id: frame.id }));
    });

  const onWrapChange = (): void =>
    runOnFrames((frame) =>
      dispatch(updateNode({ changes: wrap ? { layoutWrap: false, verticalGap: 0 } : { layoutWrap: true }, id: frame.id })),
    );

  return {
    gridAutoPlacement,
    onChange,
    onGridAutoPlacementChange,
    onWrapChange,
    toggleButtons: FLOW_OPTIONS.map(({ icon, labelKey, value: optionValue }) => ({
      ariaLabel: t(`${translationNameSpace}.${labelKey}`),
      icon,
      tooltip: t(`${translationNameSpace}.${labelKey}`),
      value: optionValue,
    })),
    value,
    wrap,
  };
};
