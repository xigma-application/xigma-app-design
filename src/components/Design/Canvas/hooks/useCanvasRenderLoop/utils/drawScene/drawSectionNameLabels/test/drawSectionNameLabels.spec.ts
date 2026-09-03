// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSectionNameLabels } from '../drawSectionNameLabels';

const drawSectionNameLabelMock = vi.fn();

vi.mock('../drawSectionNameLabel', () => ({
  drawSectionNameLabel: (...args: unknown[]): void => drawSectionNameLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

const buildSection = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#444444',
    height: 100,
    id: 'section-1',
    name: 'Section 1',
    parentId: null,
    rotation: 0,
    type: NodeType.section,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildFrame = (): TSceneNode =>
  ({
    fill: '#ffffff',
    height: 100,
    id: 'frame-1',
    name: 'Frame 1',
    parentId: null,
    rotation: 0,
    childIds: [], clipContent: true, type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
  }) as TSceneNode;

const refsWith = (editingLabelId: string | null): TCanvasRefs =>
  createCanvasRefs({ sectionName: { editingLabelRef: { current: editingLabelId } } });

describe('drawSectionNameLabels', () => {
  beforeEach(() => {
    drawSectionNameLabelMock.mockClear();
  });

  it('should draw nothing when there are no section nodes', () => {
    // before
    drawSectionNameLabels(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [buildFrame()],
      refsWith(null),
    );

    // result
    expect(drawSectionNameLabelMock).not.toHaveBeenCalled();
  });

  it('should draw every section node', () => {
    // before
    const section = buildSection();

    drawSectionNameLabels(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [section],
      refsWith(null),
    );

    // result
    expect(drawSectionNameLabelMock).toHaveBeenCalledWith(gl, program, buffer, imageContext, section, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip the section currently being renamed inline', () => {
    // before
    const section = buildSection();

    drawSectionNameLabels(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      [section],
      refsWith(section.id),
    );

    // result
    expect(drawSectionNameLabelMock).not.toHaveBeenCalled();
  });
});
