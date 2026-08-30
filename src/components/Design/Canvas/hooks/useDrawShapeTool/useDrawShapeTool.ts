import { useEffect, useRef } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';
import { DEFAULT_SHAPE_SIZE } from '../../constants';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectActiveTool, selectNodes, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { NodeType, ToolName } from 'types/design/enums';
import { MouseButton } from 'types/enums';
import { TPoint } from 'types/canvas';

// utils
import { getCandidateShapes, type TCandidateShape } from '../../utils/getDragAlignmentSnap/getCandidateShapes';
import { getPointAlignmentSnap } from '../../utils/getPointAlignmentSnap';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';
import { selectLastCreatedNode } from '../../utils/selectLastCreatedNode';
import { toDraftRect } from '../../utils/toDraftRect';
import { toDraftRectWithDefault } from '../../utils/toDraftRectWithDefault';

export type TShapeToolConfig = {
  fill: string;
  name: string;
  tool: ToolName;
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section;
};

export const useDrawShapeTool = (refs: TCanvasRefs, { fill, name, tool, type }: TShapeToolConfig): void => {
  const { canvasRef, draftRef } = refs;
  const { alignmentGuideRef } = refs.transform;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const candidateShapesRef = useRef<TCandidateShape[]>([]);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      dispatch(setSelection([]));
      startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
      candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), []);
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
      const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
      const rect = toDraftRect(startRef.current, snap.point);

      draftRef.current = { ...rect, fill, type };
      alignmentGuideRef.current = snap.guide;
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
      const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
      const rect = toDraftRectWithDefault(startRef.current, snap.point, DEFAULT_SHAPE_SIZE, true, viewport.zoom);

      dispatch(addNode({ ...rect, fill, name, parentId: null, rotation: 0, type }));
      selectLastCreatedNode(dispatch, appStore);

      startRef.current = null;
      draftRef.current = null;
      alignmentGuideRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      dispatch(setActiveTool(ToolName.default));
    }

    dispatch(endHistoryGesture());
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [activeTool, alignmentGuideRef, appStore, canvasRef, dispatch, draftRef, fill, name, refs, tool, type, viewport]);
};
