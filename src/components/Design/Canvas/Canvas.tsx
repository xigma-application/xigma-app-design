import cx from 'classnames';
import { FC } from 'react';

// components
import TextEditOverlay from './components/TextEditOverlay/TextEditOverlay';

// hooks
import { useCanvasDragPan } from './hooks/useCanvasDragPan/useCanvasDragPan';
import { useCanvasPanZoom } from './hooks/useCanvasPanZoom/useCanvasPanZoom';
import { useCanvasRefs } from './hooks/useCanvasRefs/useCanvasRefs';
import { useCanvasRenderLoop } from './hooks/useCanvasRenderLoop/useCanvasRenderLoop';
import { useCanvasResize } from './hooks/useCanvasResize/useCanvasResize';
import { useClassNames } from '../core/ClassNamesProvider/hooks/useClassNames';
import { useCurvedCaretEditing } from './hooks/useCurvedCaretEditing/useCurvedCaretEditing';
import { useDrawingCursor } from './hooks/useDrawingCursor/useDrawingCursor';
import { useDrawLineTool } from './hooks/useDrawLineTool/useDrawLineTool';
import { useDrawMediaTool } from './hooks/useDrawMediaTool/useDrawMediaTool';
import { useDrawPolygonTool } from './hooks/useDrawPolygonTool/useDrawPolygonTool';
import { useDrawShapeTool } from './hooks/useDrawShapeTool/useDrawShapeTool';
import { useDrawStarTool } from './hooks/useDrawStarTool/useDrawStarTool';
import { useDrawTextOnPathTool } from './hooks/useDrawTextOnPathTool/useDrawTextOnPathTool';
import { useDrawTextTool } from './hooks/useDrawTextTool/useDrawTextTool';
import { useHandTool } from './hooks/useHandTool/useHandTool';
import { useHoverHighlight } from './hooks/useHoverHighlight/useHoverHighlight';
import { useSelectionTool } from './hooks/useSelectionTool/useSelectionTool';
import { useSliceTool } from './hooks/useSliceTool/useSliceTool';
import { useStraightCaretEditing } from './hooks/useStraightCaretEditing/useStraightCaretEditing';
import { useTextEditOnDoubleClick } from './hooks/useTextEditOnDoubleClick/useTextEditOnDoubleClick';

// others
import {
  ARROW_TOOL_SETTINGS,
  ELLIPSE_TOOL_SETTINGS,
  FRAME_TOOL_SETTINGS,
  LINE_TOOL_SETTINGS,
  MEDIA_TOOL_SETTINGS,
  POLYGON_TOOL_SETTINGS,
  RECTANGLE_TOOL_SETTINGS,
  SECTION_TOOL_SETTINGS,
  STAR_TOOL_SETTINGS,
} from './toolSettings';

// styles
import styles from './canvas.module.scss';

const Canvas: FC = () => {
  const { className } = useClassNames();
  const refs = useCanvasRefs();

  useCanvasResize(refs);
  useCanvasPanZoom(refs);
  useCanvasDragPan(refs);
  useHandTool(refs);
  useDrawShapeTool(refs, FRAME_TOOL_SETTINGS);
  useDrawShapeTool(refs, SECTION_TOOL_SETTINGS);
  useDrawShapeTool(refs, RECTANGLE_TOOL_SETTINGS);
  useDrawShapeTool(refs, ELLIPSE_TOOL_SETTINGS);
  useDrawPolygonTool(refs, POLYGON_TOOL_SETTINGS);
  useDrawStarTool(refs, STAR_TOOL_SETTINGS);
  useDrawLineTool(refs, LINE_TOOL_SETTINGS);
  useDrawLineTool(refs, ARROW_TOOL_SETTINGS);
  useDrawMediaTool(refs, MEDIA_TOOL_SETTINGS);
  useDrawTextTool(refs);
  useDrawTextOnPathTool(refs);
  useSelectionTool(refs);
  useSliceTool(refs);
  useTextEditOnDoubleClick(refs);
  useHoverHighlight(refs);
  useCurvedCaretEditing(refs);
  useStraightCaretEditing(refs);
  useDrawingCursor(refs);
  useCanvasRenderLoop(refs);

  return (
    <div className={styles.Canvas}>
      <div className={styles.Canvas__texture} />
      <canvas
        className={cx(styles['Canvas__canvas-element'], {
          [styles[`Canvas__canvas-element--${className}`]]: Boolean(className),
        })}
        ref={refs.canvasRef}
      />
      <TextEditOverlay />
    </div>
  );
};

export default Canvas;
