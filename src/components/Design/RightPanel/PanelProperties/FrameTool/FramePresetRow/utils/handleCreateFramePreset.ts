// others
import { FRAME_FILL } from 'components/Design/Canvas/constants';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { AppDispatch, store } from 'store';
import { selectViewport } from 'store/design/selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFramePreset } from '../../../types';

// utils
import { getRectCenter } from 'components/Design/Canvas/utils/getRectCenter';
import { getVisibleCanvasRect } from 'components/Design/Canvas/utils/getVisibleCanvasRect';
import { screenToWorld } from 'components/Design/Canvas/utils/screenToWorld';
import { selectLastCreatedNode } from 'components/Design/Canvas/utils/selectLastCreatedNode';

export const handleCreateFramePreset = (dispatch: AppDispatch, refs: TCanvasRefs, preset: TFramePreset): void => {
  const canvas = refs.canvasRef.current;

  if (canvas) {
    const visibleRect = getVisibleCanvasRect(
      canvas.getBoundingClientRect(),
      refs.layout.leftPanelWidthRef.current,
      refs.layout.rightPanelWidthRef.current,
    );
    const worldCenter = screenToWorld(getRectCenter(visibleRect), selectViewport(store.getState()));

    dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: FRAME_FILL,
        height: preset.height,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: preset.width,
        x: worldCenter.x - preset.width / 2,
        y: worldCenter.y - preset.height / 2,
      }),
    );

    selectLastCreatedNode(dispatch, store);
    dispatch(setActiveTool(ToolName.default));
  }
};
