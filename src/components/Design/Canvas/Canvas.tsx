import { FC, useRef } from 'react';

// components
import TextEditOverlay from './components/TextEditOverlay/TextEditOverlay';

// hooks
import { useCanvasDragPan } from './hooks/useCanvasDragPan/useCanvasDragPan';
import { useCanvasPanZoom } from './hooks/useCanvasPanZoom/useCanvasPanZoom';
import { useCanvasRenderLoop } from './hooks/useCanvasRenderLoop/useCanvasRenderLoop';
import { useCanvasResize } from './hooks/useCanvasResize/useCanvasResize';
import { useDrawingCursor } from './hooks/useDrawingCursor/useDrawingCursor';
import { useDrawLineTool } from './hooks/useDrawLineTool/useDrawLineTool';
import { useDrawMediaTool } from './hooks/useDrawMediaTool/useDrawMediaTool';
import { useDrawPolygonTool } from './hooks/useDrawPolygonTool/useDrawPolygonTool';
import { useDrawShapeTool } from './hooks/useDrawShapeTool/useDrawShapeTool';
import { useDrawStarTool } from './hooks/useDrawStarTool/useDrawStarTool';
import { useDrawTextTool } from './hooks/useDrawTextTool/useDrawTextTool';
import { useHandTool } from './hooks/useHandTool/useHandTool';
import { useHoverHighlight } from './hooks/useHoverHighlight/useHoverHighlight';
import { useSelectionTool } from './hooks/useSelectionTool/useSelectionTool';
import { useTextEditOnDoubleClick } from './hooks/useTextEditOnDoubleClick/useTextEditOnDoubleClick';

// others
import {
  ELLIPSE_TOOL_SETTINGS,
  FRAME_TOOL_SETTINGS,
  LINE_TOOL_SETTINGS,
  MEDIA_TOOL_SETTINGS,
  POLYGON_TOOL_SETTINGS,
  RECTANGLE_TOOL_SETTINGS,
  STAR_TOOL_SETTINGS,
} from './toolSettings';

// styles
import styles from './canvas.module.scss';

// types
import { TDraftEntity } from 'types/design/types';
import { TDraftRect } from 'types/canvas';

const Canvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const marqueeRef = useRef<TDraftRect | null>(null);
  const hoverRef = useRef<string | null>(null);

  useCanvasResize(canvasRef);
  useCanvasPanZoom(canvasRef);
  useCanvasDragPan(canvasRef);
  useHandTool(canvasRef);
  useDrawShapeTool(canvasRef, draftRef, FRAME_TOOL_SETTINGS);
  useDrawShapeTool(canvasRef, draftRef, RECTANGLE_TOOL_SETTINGS);
  useDrawShapeTool(canvasRef, draftRef, ELLIPSE_TOOL_SETTINGS);
  useDrawPolygonTool(canvasRef, draftRef, POLYGON_TOOL_SETTINGS);
  useDrawStarTool(canvasRef, draftRef, STAR_TOOL_SETTINGS);
  useDrawLineTool(canvasRef, draftRef, LINE_TOOL_SETTINGS);
  useDrawMediaTool(canvasRef, draftRef, MEDIA_TOOL_SETTINGS);
  useDrawTextTool(canvasRef, draftRef);
  useSelectionTool(canvasRef, marqueeRef);
  useTextEditOnDoubleClick(canvasRef);
  useHoverHighlight(canvasRef, hoverRef);
  useDrawingCursor(canvasRef);
  useCanvasRenderLoop(canvasRef, draftRef, marqueeRef, hoverRef);

  return (
    <div className={styles.Canvas}>
      <div className={styles.Canvas__texture} />
      <canvas className={styles['Canvas__canvas-element']} ref={canvasRef} />
      <TextEditOverlay />
    </div>
  );
};

export default Canvas;
