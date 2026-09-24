import { useRef } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentLayout, AlignTextBaseline, GapMode, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutEffectiveGaps } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutEffectiveGaps';
import { getFrameGapState } from './utils/getFrameGapState';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { useColumnGridArea, TUseColumnGridAreaResult } from './useColumnGridArea';

export type TUseColumnAlignmentLayoutResult = {
  alignment: AlignmentLayout | undefined;
  gridArea: TUseColumnGridAreaResult;
  horizontalGap: number;
  horizontalGapDisplay: string | undefined;
  horizontalGapMode: GapMode;
  isBaselineAligned: boolean;
  isGrid: boolean;
  isHorizontal: boolean;
  isHorizontalGapModeDisabled: boolean;
  isVerticalGapModeDisabled: boolean;
  isVisible: boolean;
  isWrap: boolean;
  onChangeAlignment: TFunc<[AlignmentLayout]>;
  onCommitHorizontalGap: TFunc<[number]>;
  onGapDragEnd: TFunc;
  onGapDragStart: TFunc;
  onScrubHorizontalGap: TFunc<[number]>;
  onScrubVerticalGap: TFunc<[number]>;
  onCommitVerticalGap: TFunc<[number]>;
  onRemoveBaselineAlignment: TFunc;
  onSelectHorizontalGapAuto: TFunc;
  onSelectHorizontalGapFixed: TFunc;
  onSelectVerticalGapAuto: TFunc;
  onSelectVerticalGapFixed: TFunc;
  verticalGap: number;
  verticalGapDisplay: string | undefined;
  verticalGapMode: GapMode;
};

export const useColumnAlignmentLayout = (): TUseColumnAlignmentLayoutResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const gapFrames = selectedNodes.filter(isManagedLayoutFrame);
  const isMultiSelection = gapFrames.length > 1;
  const gapStartRef = useRef<Record<string, { horizontal: number; vertical: number }>>({});
  const id = frameNode?.id ?? '';
  const gridArea = useColumnGridArea();
  const layoutMode = frameNode?.layoutMode;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const isGrid = layoutMode === LayoutMode.grid;
  const isBaselineAligned = isHorizontal && frameNode?.alignTextBaseline === AlignTextBaseline.on;
  const horizontalGapMode = frameNode?.horizontalGapMode ?? GapMode.fixed;
  const verticalGapMode = frameNode?.verticalGapMode ?? GapMode.fixed;
  const children: TSceneNode[] = frameNode?.childIds.map((childId) => nodes[childId]).filter(Boolean) ?? [];
  const effectiveGaps = frameNode ? getAutoLayoutEffectiveGaps(frameNode, children) : { horizontal: 0, vertical: 0 };
  const rawHorizontalGap = frameNode?.horizontalGap ?? 0;
  const rawVerticalGap = frameNode?.verticalGap ?? (isHorizontal ? rawHorizontalGap : 0);
  const horizontalGap = horizontalGapMode === GapMode.auto ? effectiveGaps.horizontal : rawHorizontalGap;
  const verticalGap = verticalGapMode === GapMode.auto ? effectiveGaps.vertical : rawVerticalGap;
  const gapTargets = isMultiSelection ? gapFrames : frameNode ? [frameNode] : [];
  const alignments = gapTargets.map((frame) => frame.layoutAlignment ?? AlignmentLayout.topLeft);
  const alignment = alignments.every((item) => item === alignments[0]) ? (alignments[0] ?? AlignmentLayout.topLeft) : undefined;

  const getGapDisplay = (axis: 'horizontal' | 'vertical'): string | undefined => {
    const states = gapFrames.map((frame) => getFrameGapState(frame, nodes, axis));
    const isMixed = states.some((state) => state.mode !== states[0].mode || state.value !== states[0].value);

    return isMultiSelection && isMixed ? MIXED_LABEL : undefined;
  };

  const setGap = (frameId: string, axis: 'horizontal' | 'vertical', value: number): void => {
    dispatch(
      updateNode({
        changes:
          axis === 'horizontal'
            ? { horizontalGap: value, horizontalGapMode: undefined }
            : { verticalGap: value, verticalGapMode: undefined },
        id: frameId,
      }),
    );
  };

  const commitGap = (axis: 'horizontal' | 'vertical', nextGap: number): void => {
    if (isMultiSelection) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      gapTargets.forEach((frame) => setGap(frame.id, axis, nextGap));
      dispatch(endHistoryGesture());
    } else {
      setGap(id, axis, nextGap);
    }
  };

  const scrubGap = (axis: 'horizontal' | 'vertical', nextGap: number): void => {
    if (isMultiSelection) {
      const start = gapStartRef.current;
      const base = start[gapTargets[0].id]?.[axis] ?? 0;

      gapTargets.forEach((frame) => setGap(frame.id, axis, (start[frame.id]?.[axis] ?? 0) + nextGap - base));
    } else {
      setGap(id, axis, nextGap);
    }
  };

  const startGapScrub = (): void => {
    gapStartRef.current = Object.fromEntries(
      gapTargets.map((frame) => [
        frame.id,
        { horizontal: getFrameGapState(frame, nodes, 'horizontal').value, vertical: getFrameGapState(frame, nodes, 'vertical').value },
      ]),
    );
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  };

  const selectGapMode = (axis: 'horizontal' | 'vertical', mode: GapMode): void => {
    gapTargets.forEach((frame) => {
      const fixedGap = Math.round(getFrameGapState(frame, nodes, axis).value);
      const autoChanges = axis === 'horizontal' ? { horizontalGapMode: GapMode.auto } : { verticalGapMode: GapMode.auto };
      const fixedChanges =
        axis === 'horizontal'
          ? { horizontalGap: fixedGap, horizontalGapMode: undefined }
          : { verticalGap: fixedGap, verticalGapMode: undefined };
      const changes = mode === GapMode.auto ? autoChanges : fixedChanges;

      dispatch(updateNode({ changes, id: frame.id }));
    });
  };

  return {
    alignment,
    gridArea,
    horizontalGap,
    horizontalGapDisplay: getGapDisplay('horizontal'),
    horizontalGapMode,
    isBaselineAligned,
    isGrid,
    isHorizontal,
    isHorizontalGapModeDisabled: isGrid || (frameNode?.widthSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVerticalGapModeDisabled: isGrid || (frameNode?.heightSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVisible: isGrid || layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical,
    isWrap: Boolean(frameNode?.layoutWrap),
    onChangeAlignment: (nextAlignment): void => {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      gapTargets.forEach((frame) => dispatch(updateNode({ changes: { layoutAlignment: nextAlignment }, id: frame.id })));
      dispatch(endHistoryGesture());
    },
    onCommitHorizontalGap: (nextGap) => commitGap('horizontal', nextGap),
    onCommitVerticalGap: (nextGap) => commitGap('vertical', nextGap),
    onGapDragEnd: () => dispatch(endHistoryGesture()),
    onGapDragStart: startGapScrub,
    onRemoveBaselineAlignment: () => dispatch(updateNode({ changes: { alignTextBaseline: AlignTextBaseline.off }, id })),
    onScrubHorizontalGap: (nextGap) => scrubGap('horizontal', nextGap),
    onScrubVerticalGap: (nextGap) => scrubGap('vertical', nextGap),
    onSelectHorizontalGapAuto: () => selectGapMode('horizontal', GapMode.auto),
    onSelectHorizontalGapFixed: () => selectGapMode('horizontal', GapMode.fixed),
    onSelectVerticalGapAuto: () => selectGapMode('vertical', GapMode.auto),
    onSelectVerticalGapFixed: () => selectGapMode('vertical', GapMode.fixed),
    verticalGap,
    verticalGapDisplay: getGapDisplay('vertical'),
    verticalGapMode,
  };
};
