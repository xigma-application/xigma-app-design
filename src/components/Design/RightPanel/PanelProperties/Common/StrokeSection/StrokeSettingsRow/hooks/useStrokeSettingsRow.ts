import { FocusEvent } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeAlign, StrokeMode, StrokeSides } from 'types/design/enums';
import { TAppearanceNode, isAppearanceNode } from '../../../AppearanceSection/types';
import { TSceneNodeChanges } from 'types/design/types';
import { TStrokeSide } from 'utils/design/stroke/types';

// utils
import { clampStrokeWeight } from '../utils/clampStrokeWeight';
import { getEffectiveStrokeAlign } from '../utils/getEffectiveStrokeAlign';
import { getSharedStrokeSetting } from '../utils/getSharedStrokeSetting';
import { getSharedStrokeSides } from '../utils/getSharedStrokeSides';
import { getStrokeSideEditChange } from '../utils/getStrokeSideEditChange';
import { getSharedValue } from '../utils/getSharedValue';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';
import { getStrokeSidesChange } from 'utils/design/stroke/getStrokeSidesChange';
import { getStrokeWeightChange } from 'utils/design/stroke/getStrokeWeightChange';
import { getStrokeWeightDisplay } from 'utils/design/stroke/getStrokeWeightDisplay';
import { parseStrokeWeight } from '../utils/parseStrokeWeight';

export type TUseStrokeSettingsRowResult = {
  isNonBasicMode: boolean;
  isStrokeModeMixed: boolean;
  isWeightMixed: boolean;
  onPositionSelect: TFunc<[StrokeAlign]>;
  onSideBlur: (side: TStrokeSide) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onSideScrub: (side: TStrokeSide) => TFunc<[number]>;
  onSidesSelect: TFunc<[StrokeSides]>;
  onWeightBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onWeightDragEnd: TFunc;
  onWeightDragStart: TFunc;
  onWeightScrub: TFunc<[number]>;
  position: StrokeAlign | undefined;
  sideScrubValues: Record<TStrokeSide, number>;
  sideWeights: Record<TStrokeSide, number | undefined>;
  sides: StrokeSides | undefined;
  weight: number;
};

export const useStrokeSettingsRow = (): TUseStrokeSettingsRowResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isAppearanceNode);
  const [firstNode] = nodes;
  const weight = firstNode?.strokeWidth ?? 1;
  const weightDisplay = nodes.length > 0 ? getSharedValue(nodes.map(getStrokeWeightDisplay)) : weight;
  const sideWidthsList = nodes.map(getStrokeSideWidths);
  const sideScrubValues = sideWidthsList[0] ?? { bottom: 0, left: 0, right: 0, top: 0 };
  const getSideWeight = (side: TStrokeSide): number | undefined => getSharedValue(sideWidthsList.map((widths) => widths[side]));
  const modes = nodes.map((node) => node.strokeMode ?? StrokeMode.basic);
  const position = getSharedStrokeSetting(nodes.map(getEffectiveStrokeAlign), StrokeAlign.inside);
  const sides = getSharedStrokeSides(nodes.map((node) => node.strokeSides ?? StrokeSides.all));

  const commitEach = (getChanges: TFunc<[TAppearanceNode, number], TSceneNodeChanges>): void => {
    if (nodes.length > 0) {
      dispatch(updateNodes(nodes.map((node, index) => ({ changes: getChanges(node, index), id: node.id }))));
    }
  };

  const commitEachWithHistory = (getChanges: TFunc<[TAppearanceNode, number], TSceneNodeChanges>): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commitEach(getChanges);
    dispatch(endHistoryGesture());
  };

  const onPositionSelect = (strokeAlign: StrokeAlign): void => {
    if (strokeAlign !== position) {
      commitEachWithHistory(() => ({ strokeAlign }));
    }
  };

  const onSidesSelect = (nextSides: StrokeSides): void => {
    if (nodes.some((node) => (node.strokeSides ?? StrokeSides.all) !== nextSides)) {
      commitEachWithHistory((node) => getStrokeSidesChange(node, nextSides));
    }
  };

  const onWeightBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = parseStrokeWeight(event.target.value);

    if (nodes.length > 0 && parsed !== null && parsed !== weightDisplay) {
      commitEachWithHistory((node) => getStrokeWeightChange(node, parsed));
    } else {
      event.target.value = event.target.defaultValue;
    }
  };

  const onSideBlur =
    (side: TStrokeSide) =>
    (event: FocusEvent<HTMLInputElement>): void => {
      const parsed = parseStrokeWeight(event.target.value);

      if (nodes.length > 0 && parsed !== null && parsed !== getSideWeight(side)) {
        commitEachWithHistory((node) => getStrokeSideEditChange(node, side, parsed));
      } else {
        event.target.value = event.target.defaultValue;
      }
    };

  return {
    isNonBasicMode: modes.some((mode) => mode !== StrokeMode.basic),
    isStrokeModeMixed: getSharedValue(modes) === undefined,
    isWeightMixed: weightDisplay === undefined || weightDisplay === null,
    onPositionSelect,
    onSideBlur,
    onSideScrub: (side) => (value) =>
      commitEach((node, index) =>
        getStrokeSideEditChange(node, side, clampStrokeWeight(sideWidthsList[index][side] + value - sideScrubValues[side])),
      ),
    onSidesSelect,
    onWeightBlur,
    onWeightDragEnd: () => dispatch(endHistoryGesture()),
    onWeightDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onWeightScrub: (value) =>
      commitEach((node) => getStrokeWeightChange(node, clampStrokeWeight((node.strokeWidth ?? 1) + value - weight))),
    position,
    sideScrubValues,
    sideWeights: { bottom: getSideWeight('bottom'), left: getSideWeight('left'), right: getSideWeight('right'), top: getSideWeight('top') },
    sides,
    weight,
  };
};
