import cx from 'classnames';
import { FC } from 'react';

// components
import Comment from './Comment/Comment';
import TextEditOverlay from './TextEditOverlay/TextEditOverlay';

// core
import { useClassNames } from '../core/ClassNamesProvider/hooks/useClassNames';

// hooks
import { useCanvasDragPan } from './hooks/useCanvasDragPan/useCanvasDragPan';
import { useCanvasPanZoom } from './hooks/useCanvasPanZoom/useCanvasPanZoom';
import { useCanvasRenderLoop } from './hooks/useCanvasRenderLoop/useCanvasRenderLoop';
import { useCanvasResize } from './hooks/useCanvasResize/useCanvasResize';
import { useCommentTool } from './hooks/useCommentTool/useCommentTool';
import { useCurvedCaretEditing } from './hooks/useCurvedCaretEditing/useCurvedCaretEditing';
import { useDrawingCursor } from './hooks/useDrawingCursor/useDrawingCursor';
import { useDrawLineTool } from './hooks/useDrawLineTool/useDrawLineTool';
import { useDrawMediaTool } from './hooks/useDrawMediaTool/useDrawMediaTool';
import { useDrawPencilTool } from './hooks/useDrawPencilTool/useDrawPencilTool';
import { useDrawPenTool } from './hooks/useDrawPenTool/useDrawPenTool';
import { useDrawPolygonTool } from './hooks/useDrawPolygonTool/useDrawPolygonTool';
import { useDrawShapeTool } from './hooks/useDrawShapeTool/useDrawShapeTool';
import { useDrawStarTool } from './hooks/useDrawStarTool/useDrawStarTool';
import { useDrawTextOnPathTool } from './hooks/useDrawTextOnPathTool/useDrawTextOnPathTool';
import { useDrawTextTool } from './hooks/useDrawTextTool/useDrawTextTool';
import { useHandTool } from './hooks/useHandTool/useHandTool';
import { useHoverHighlight } from './hooks/useHoverHighlight/useHoverHighlight';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts/useKeyboardShortcuts';
import { useRegisterColorPixelSampler } from './hooks/useRegisterColorPixelSampler/useRegisterColorPixelSampler';
import { useSelectionTool } from './hooks/useSelectionTool/useSelectionTool';
import { useSliceTool } from './hooks/useSliceTool/useSliceTool';
import { useStraightCaretEditing } from './hooks/useStraightCaretEditing/useStraightCaretEditing';
import { useTextEditOnDoubleClick } from './hooks/useTextEditOnDoubleClick/useTextEditOnDoubleClick';
import { useVectorEditOnDoubleClick } from './hooks/useVectorEditOnDoubleClick/useVectorEditOnDoubleClick';

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

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// styles
import styles from './canvas.module.scss';

const Canvas: FC = () => {
  const { className } = useClassNames();
  const refs = useCanvasRefsContext();

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
  useDrawPenTool(refs);
  useDrawPencilTool(refs);
  useDrawTextTool(refs);
  useDrawTextOnPathTool(refs);
  useCommentTool(refs);
  useSelectionTool(refs);
  useSliceTool(refs);
  useTextEditOnDoubleClick(refs);
  useVectorEditOnDoubleClick(refs);
  useHoverHighlight(refs);
  useCurvedCaretEditing(refs);
  useStraightCaretEditing(refs);
  useDrawingCursor(refs);
  useKeyboardShortcuts(refs);
  useCanvasRenderLoop(refs);
  useRegisterColorPixelSampler(refs);

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
      <Comment />
    </div>
  );
};

export default Canvas;
