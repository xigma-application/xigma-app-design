// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNode, updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../../AppearanceSection/types';
import { TCommitStrokeChanges, TStrokeChanges, TStrokeSettingsValues, TUseStrokeSettingsBasicTabResult } from './types';

// utils
import { isStrokeSettingsNode } from '../../../../../../../AppearanceSection/utils/isStrokeSettingsNode';
import { getSharedStrokeSettings } from './utils/getSharedStrokeSettings';
import { getStrokeSettingsValues } from './utils/getStrokeSettingsValues';
import { handleStrokeDashBlur } from './utils/handleStrokeDashBlur';
import { handleStrokeDashCapSelect } from './utils/handleStrokeDashCapSelect';
import { handleStrokeDashScrub } from './utils/handleStrokeDashScrub';
import { handleStrokeDashStep } from './utils/handleStrokeDashStep';
import { handleStrokeDashesBlur } from './utils/handleStrokeDashesBlur';
import { handleStrokeDashesScrub } from './utils/handleStrokeDashesScrub';
import { handleStrokeDashesStep } from './utils/handleStrokeDashesStep';
import { handleStrokeGapBlur } from './utils/handleStrokeGapBlur';
import { handleStrokeGapScrub } from './utils/handleStrokeGapScrub';
import { handleStrokeGapStep } from './utils/handleStrokeGapStep';
import { handleStrokeJoinSelect } from './utils/handleStrokeJoinSelect';
import { handleStrokeMiterAngleBlur } from './utils/handleStrokeMiterAngleBlur';
import { handleStrokeMiterAngleStep } from './utils/handleStrokeMiterAngleStep';
import { handleStrokeMiterAngleScrub } from './utils/handleStrokeMiterAngleScrub';
import { handleStrokeStyleSelect } from './utils/handleStrokeStyleSelect';

export const useStrokeSettingsBasicTab = (): TUseStrokeSettingsBasicTabResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isStrokeSettingsNode);
  const valuesList = nodes.length > 0 ? nodes.map(getStrokeSettingsValues) : [getStrokeSettingsValues(undefined)];
  const [scrubValues] = valuesList;
  const shared = getSharedStrokeSettings(valuesList);

  const commit = (changes: TStrokeChanges): void => {
    if (nodes.length > 0) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNodes(nodes.map((node) => ({ changes, id: node.id }))));
      dispatch(endHistoryGesture());
    }
  };

  const scrubEach = (scrub: TFunc<[TStrokeSettingsValues, TCommitStrokeChanges]>): void =>
    nodes.forEach((node, index) => scrub(valuesList[index], (changes) => dispatch(updateNode({ changes, id: node.id }))));

  return {
    ...shared,
    hasJoin: nodes.some(isAppearanceNode),
    onDashBlur: (event) => handleStrokeDashBlur(event, shared.dash, commit),
    onDashCapSelect: (value) => handleStrokeDashCapSelect(value, shared.dashCap, commit),
    onDashScrub: (value) => scrubEach((values, update) => handleStrokeDashScrub(values.dash + value - scrubValues.dash, update)),
    onDashStep: (text) => handleStrokeDashStep(text, shared.dash, commit),
    onDashesBlur: (event) => handleStrokeDashesBlur(event, shared.dashes, commit),
    onDashesScrub: (value) =>
      scrubEach((values, update) => handleStrokeDashesScrub(values.dashes[0] + value - scrubValues.dashes[0], values.dashes, update)),
    onDashesStep: (text) => handleStrokeDashesStep(text, shared.dashes, commit),
    onGapBlur: (event) => handleStrokeGapBlur(event, shared.gap, commit),
    onGapScrub: (value) => scrubEach((values, update) => handleStrokeGapScrub(values.gap + value - scrubValues.gap, update)),
    onGapStep: (text) => handleStrokeGapStep(text, shared.gap, commit),
    onJoinSelect: (value) => handleStrokeJoinSelect(value, shared.join, commit),
    onMiterAngleBlur: (event) => handleStrokeMiterAngleBlur(event, shared.miterAngle, commit),
    onMiterAngleDragEnd: () => dispatch(endHistoryGesture()),
    onMiterAngleDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onMiterAngleScrub: (value) =>
      scrubEach((values, update) => handleStrokeMiterAngleScrub(values.miterAngle + value - scrubValues.miterAngle, update)),
    onMiterAngleStep: (text) => handleStrokeMiterAngleStep(text, shared.miterAngle, commit),
    onScrubDragEnd: () => dispatch(endHistoryGesture()),
    onScrubDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onStyleSelect: (nextStyle) => handleStrokeStyleSelect(nextStyle, shared.style, commit),
    scrubValues,
  };
};
