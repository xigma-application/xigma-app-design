import { useEffect, useRef } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';
import { DEFAULT_SHAPE_SIZE } from '../../constants';

// store
import { setActiveTool, setSelection, startTextEdit } from 'store/design/slice';
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
import { toDraftRect } from '../../utils/toDraftRect';
import { toDraftRectWithDefault } from '../../utils/toDraftRectWithDefault';

export const useDrawTextTool = (refs: TCanvasRefs): void => {
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

      draftRef.current = { ...rect, type: NodeType.text };
      alignmentGuideRef.current = snap.guide;
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
      const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
      const rect = toDraftRectWithDefault(startRef.current, snap.point, DEFAULT_SHAPE_SIZE, false, viewport.zoom);

      dispatch(startTextEdit({ box: { ...rect, flipX: false, flipY: false, rotation: 0 } }));
      startRef.current = null;
      draftRef.current = null;
      alignmentGuideRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      dispatch(setActiveTool(ToolName.default));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.text) {
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
  }, [activeTool, alignmentGuideRef, appStore, canvasRef, dispatch, draftRef, viewport]);
};
