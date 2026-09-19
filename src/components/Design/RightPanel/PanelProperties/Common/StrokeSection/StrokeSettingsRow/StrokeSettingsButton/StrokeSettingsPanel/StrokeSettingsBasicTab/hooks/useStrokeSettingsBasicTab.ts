import { FocusEvent, useState } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../AppearanceSection/types';
import { StrokeAlign, StrokeJoin } from 'types/design/enums';

// others
import { STROKE_MITER_ANGLE_DEFAULT } from 'constant/strokeMiterAngle';
import { DEFAULT_STROKE_JOIN, DEFAULT_STROKE_STYLE, STROKE_JOINS, TStrokeStyle } from '../constants';

// utils
import { getStrokeMiterAngleFromInput } from 'utils/design/stroke/getStrokeMiterAngleFromInput';

export type TUseStrokeSettingsBasicTabResult = {
  hasDashes: boolean;
  isCustom: boolean;
  isDashed: boolean;
  isMiter: boolean;
  join: StrokeJoin;
  miterAngle: number;
  onJoinSelect: TFunc<[string]>;
  onMiterAngleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onMiterAngleDragEnd: TFunc;
  onMiterAngleDragStart: TFunc;
  onMiterAngleScrub: TFunc<[number]>;
  onStyleSelect: TFunc<[TStrokeStyle]>;
  style: TStrokeStyle;
};

export const useStrokeSettingsBasicTab = (): TUseStrokeSettingsBasicTabResult => {
  const dispatch = useAppDispatch();
  const [style, setStyle] = useState<TStrokeStyle>(DEFAULT_STROKE_STYLE);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const join = node?.strokeJoin ?? DEFAULT_STROKE_JOIN;
  const miterAngle = node?.strokeMiterAngle ?? STROKE_MITER_ANGLE_DEFAULT;

  const onMiterAngleScrub = (value: number): void => {
    const nextAngle = getStrokeMiterAngleFromInput(String(value));

    if (node && nextAngle !== undefined) {
      dispatch(updateNode({ changes: { strokeMiterAngle: nextAngle }, id: node.id }));
    }
  };

  const onMiterAngleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const nextAngle = getStrokeMiterAngleFromInput(event.target.value);

    if (node && nextAngle !== undefined && nextAngle !== miterAngle) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes: { strokeMiterAngle: nextAngle }, id: node.id }));
      dispatch(endHistoryGesture());
    }

    event.target.value = `${nextAngle ?? miterAngle}°`;
  };

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
    isMiter: join === StrokeJoin.miter && (node?.strokeAlign ?? StrokeAlign.inside) !== StrokeAlign.inside,
    join,
    miterAngle,
    onJoinSelect,
    onMiterAngleBlur,
    onMiterAngleDragEnd: () => dispatch(endHistoryGesture()),
    onMiterAngleDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onMiterAngleScrub,
    onStyleSelect: (nextStyle: TStrokeStyle): void => setStyle(nextStyle),
    style,
  };
};
