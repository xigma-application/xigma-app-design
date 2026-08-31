// others
import { FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftEntity, TSceneNode } from 'types/design/types';
import { TImageRenderContext } from '../../../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawDraftFrameNameLabel } from '../drawDraftFrameNameLabel';

const drawFrameNameLabelMock = vi.fn();
const getNextFrameNameMock = vi.fn();

vi.mock('../drawFrameNameLabel', () => ({
  drawFrameNameLabel: (...args: unknown[]): void => drawFrameNameLabelMock(...args),
}));
vi.mock('store/design/utils/getNextFrameName', () => ({
  getNextFrameName: (...args: unknown[]): unknown => getNextFrameNameMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const imageContext = {} as TImageRenderContext;

const draftFrame: TDraftEntity = { fill: '#ffffff', height: 100, type: NodeType.frame, width: 200, x: 10, y: 20 };
const nodes: Record<string, TSceneNode> = {};

describe('drawDraftFrameNameLabel', () => {
  beforeEach(() => {
    drawFrameNameLabelMock.mockClear();
    getNextFrameNameMock.mockClear().mockReturnValue('Frame 3');
  });

  it('should draw the would-be name, in the selection blue, for a frame being drawn', () => {
    // before
    drawDraftFrameNameLabel(gl, imageContext, createCanvasRefs({ draftRef: { current: draftFrame } }), nodes, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getNextFrameNameMock).toHaveBeenCalledWith(nodes);
    expect(drawFrameNameLabelMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      {
        fill: '#ffffff',
        height: 100,
        id: '',
        name: 'Frame 3',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 200,
        x: 10,
        y: 20,
      },
      FRAME_NAME_LABEL_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when there is no draft shape', () => {
    // before
    drawDraftFrameNameLabel(gl, imageContext, createCanvasRefs(), nodes, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawFrameNameLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the draft shape is not a frame', () => {
    // before
    drawDraftFrameNameLabel(
      gl,
      imageContext,
      createCanvasRefs({ draftRef: { current: { ...draftFrame, type: NodeType.rectangle } } }),
      nodes,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawFrameNameLabelMock).not.toHaveBeenCalled();
  });
});
