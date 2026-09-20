// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../../AppearanceSection/types';
import { TStrokeChanges, TUseStrokeSettingsBasicTabResult } from './types';

// utils
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
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const values = getStrokeSettingsValues(node);

  const update = (changes: TStrokeChanges): void => {
    if (node) {
      dispatch(updateNode({ changes, id: node.id }));
    }
  };

  const commit = (changes: TStrokeChanges): void => {
    if (node) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      update(changes);
      dispatch(endHistoryGesture());
    }
  };

  return {
    ...values,
    onDashBlur: (event) => handleStrokeDashBlur(event, values.dash, commit),
    onDashCapSelect: (value) => handleStrokeDashCapSelect(value, values.dashCap, commit),
    onDashScrub: (value) => handleStrokeDashScrub(value, update),
    onDashStep: (text) => handleStrokeDashStep(text, values.dash, commit),
    onDashesBlur: (event) => handleStrokeDashesBlur(event, values.dashes, commit),
    onDashesScrub: (value) => handleStrokeDashesScrub(value, values.dashes, update),
    onDashesStep: (text) => handleStrokeDashesStep(text, values.dashes, commit),
    onGapBlur: (event) => handleStrokeGapBlur(event, values.gap, commit),
    onGapScrub: (value) => handleStrokeGapScrub(value, update),
    onGapStep: (text) => handleStrokeGapStep(text, values.gap, commit),
    onJoinSelect: (value) => handleStrokeJoinSelect(value, values.join, commit),
    onMiterAngleBlur: (event) => handleStrokeMiterAngleBlur(event, values.miterAngle, commit),
    onMiterAngleDragEnd: () => dispatch(endHistoryGesture()),
    onMiterAngleDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onMiterAngleScrub: (value) => handleStrokeMiterAngleScrub(value, update),
    onMiterAngleStep: (text) => handleStrokeMiterAngleStep(text, values.miterAngle, commit),
    onScrubDragEnd: () => dispatch(endHistoryGesture()),
    onScrubDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onStyleSelect: (nextStyle) => handleStrokeStyleSelect(nextStyle, values.style, commit),
  };
};
