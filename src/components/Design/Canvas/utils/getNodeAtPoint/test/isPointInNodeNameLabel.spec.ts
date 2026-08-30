// types
import { NodeType } from 'types/design/enums';
import { TFrameNameLabelRect } from '../../getFrameNameLabelRects';
import { TFrameNode, TSectionNode, TSceneNode } from 'types/design/types';
import { TSectionNameLabelRect } from '../../getSectionNameLabelRects';

// utils
import { isPointInNodeNameLabel } from '../isPointInNodeNameLabel';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#ffffff',
  height: 50,
  id: 'frame-a',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 80,
  x: 0,
  y: 100,
  ...overrides,
});

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  fill: '#444444',
  height: 50,
  id: 'section-a',
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 80,
  x: 0,
  y: 100,
  ...overrides,
});

const frameLabelRect: TFrameNameLabelRect = { center: { x: 40, y: 90 }, height: 20, nodeId: 'frame-a', width: 60 };
const sectionLabelRect: TSectionNameLabelRect = { height: 20, nodeId: 'section-a', width: 60, x: 10, y: 70 };

describe('isPointInNodeNameLabel', () => {
  it('should hit a frame whose id matches a frame name label rect containing the point', () => {
    expect(isPointInNodeNameLabel(frameLabelRect.center, buildFrame(), [frameLabelRect], [])).toBe(true);
  });

  it('should miss a frame when the point falls outside its label rect', () => {
    expect(isPointInNodeNameLabel({ x: 999, y: 999 }, buildFrame(), [frameLabelRect], [])).toBe(false);
  });

  it('should miss a frame with no matching label rect (e.g. an empty name produced none)', () => {
    expect(isPointInNodeNameLabel(frameLabelRect.center, buildFrame({ id: 'other-frame' }), [frameLabelRect], [])).toBe(false);
  });

  it('should hit a section whose id matches a section name label rect containing the point', () => {
    const point = { x: sectionLabelRect.x + sectionLabelRect.width / 2, y: sectionLabelRect.y + sectionLabelRect.height / 2 };

    expect(isPointInNodeNameLabel(point, buildSection(), [], [sectionLabelRect])).toBe(true);
  });

  it('should miss a section when the point falls outside its label rect', () => {
    expect(isPointInNodeNameLabel({ x: 999, y: 999 }, buildSection(), [], [sectionLabelRect])).toBe(false);
  });

  it('should return false for a node type that has no name label at all', () => {
    const rect: TSceneNode = {
      fill: '#000000',
      height: 50,
      id: 'rect-a',
      name: 'Rectangle 1',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 80,
      x: 0,
      y: 100,
    };

    expect(isPointInNodeNameLabel(frameLabelRect.center, rect, [frameLabelRect], [sectionLabelRect])).toBe(false);
  });
});
