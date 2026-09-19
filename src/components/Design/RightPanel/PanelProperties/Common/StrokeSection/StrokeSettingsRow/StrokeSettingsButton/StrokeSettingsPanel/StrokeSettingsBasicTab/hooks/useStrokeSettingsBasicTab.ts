import { useState } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../AppearanceSection/types';
import { StrokeJoin } from 'types/design/enums';

// others
import { DEFAULT_STROKE_JOIN, DEFAULT_STROKE_STYLE, STROKE_JOINS, TStrokeStyle } from '../constants';

export type TUseStrokeSettingsBasicTabResult = {
  hasDashes: boolean;
  isCustom: boolean;
  isDashed: boolean;
  join: StrokeJoin;
  onJoinSelect: TFunc<[string]>;
  onStyleSelect: TFunc<[TStrokeStyle]>;
  style: TStrokeStyle;
};

export const useStrokeSettingsBasicTab = (): TUseStrokeSettingsBasicTabResult => {
  const dispatch = useAppDispatch();
  const [style, setStyle] = useState<TStrokeStyle>(DEFAULT_STROKE_STYLE);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const join = node?.strokeJoin ?? DEFAULT_STROKE_JOIN;

  const onJoinSelect = (value: string): void => {
    const nextJoin = STROKE_JOINS.find((option) => option === value);

    if (node && nextJoin && nextJoin !== join) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes: { strokeJoin: nextJoin }, id: node.id }));
      dispatch(endHistoryGesture());
    }
  };

  return {
    hasDashes: style !== 'solid',
    isCustom: style === 'custom',
    isDashed: style === 'dashed',
    join,
    onJoinSelect,
    onStyleSelect: (nextStyle: TStrokeStyle): void => setStyle(nextStyle),
    style,
  };
};
