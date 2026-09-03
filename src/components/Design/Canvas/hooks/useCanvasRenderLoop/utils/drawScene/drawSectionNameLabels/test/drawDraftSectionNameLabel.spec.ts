// types
import { NodeType } from 'types/design/enums';
import { TDraftEntity, TSceneNode } from 'types/design/types';
import { TImageRenderContext } from '../../../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawDraftSectionNameLabel } from '../drawDraftSectionNameLabel';

const drawSectionNameLabelMock = vi.fn();
const getNextSectionNameMock = vi.fn();

vi.mock('../drawSectionNameLabel', () => ({
  drawSectionNameLabel: (...args: unknown[]): void => drawSectionNameLabelMock(...args),
}));
vi.mock('store/design/utils/getNextSectionName', () => ({
  getNextSectionName: (...args: unknown[]): unknown => getNextSectionNameMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TImageRenderContext;

const draftSection: TDraftEntity = { fill: '#444444', height: 100, type: NodeType.section, width: 200, x: 10, y: 20 };
const nodes: Record<string, TSceneNode> = {};

describe('drawDraftSectionNameLabel', () => {
  beforeEach(() => {
    drawSectionNameLabelMock.mockClear();
    getNextSectionNameMock.mockClear().mockReturnValue('Section 3');
  });

  it('should draw the would-be name for a section being drawn', () => {
    // before
    drawDraftSectionNameLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ draftRef: { current: draftSection } }),
      nodes,
    );

    // result
    expect(getNextSectionNameMock).toHaveBeenCalledWith(nodes);
    expect(drawSectionNameLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      {
        childIds: [],
        fill: '#444444',
        height: 100,
        id: '',
        name: 'Section 3',
        parentId: null,
        rotation: 0,
        type: NodeType.section,
        width: 200,
        x: 10,
        y: 20,
      },
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when there is no draft shape', () => {
    // before
    drawDraftSectionNameLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
      nodes,
    );

    // result
    expect(drawSectionNameLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the draft shape is not a section', () => {
    // before
    drawDraftSectionNameLabel(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ draftRef: { current: { ...draftSection, type: NodeType.frame } } }),
      nodes,
    );

    // result
    expect(drawSectionNameLabelMock).not.toHaveBeenCalled();
  });
});
