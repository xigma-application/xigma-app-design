// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from '../enums';
import { TFrameNode, TLineNode, TRectangleNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { getSvgLayerAncestorGroups } from '../getSvgLayerAncestorGroups';

const bounds = { height: 400, width: 400, x: 0, y: 0 };

const rotatedParent: TFrameNode = {
  childIds: [],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'parent',
  name: 'parent',
  parentId: null,
  rotation: 90,
  type: NodeType.frame,
  width: 100,
  x: 100,
  y: 100,
};

const nodesById: Record<string, TSceneNode> = { parent: rotatedParent };

describe('getSvgLayerAncestorGroups', () => {
  it('should compute ancestor groups for a real-text layer', () => {
    const node: TTextNode = {
      content: 'Hi',
      fill: '#000000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 16,
      height: 20,
      id: 'text',
      name: 'text',
      parentId: 'parent',
      rotation: 90,
      type: NodeType.text,
      width: 20,
      x: 170,
      y: 140,
    };

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.text }, nodesById, bounds)).toEqual([
      { id: 'parent', markup: '<g transform="rotate(90, 150, 150)">' },
    ]);
  });

  it('should compute ancestor groups for a box-model vector layer (e.g. a rectangle)', () => {
    const node: TRectangleNode = {
      fills: [],
      height: 20,
      id: 'rect',
      name: 'rect',
      parentId: 'parent',
      rotation: 90,
      type: NodeType.rectangle,
      width: 20,
      x: 170,
      y: 140,
    };

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.vector }, nodesById, bounds)).toEqual([
      { id: 'parent', markup: '<g transform="rotate(90, 150, 150)">' },
    ]);
  });

  it('should return no groups for a baked-geometry vector layer (line), even under a rotated ancestor', () => {
    const node: TLineNode = {
      id: 'line',
      name: 'line',
      parentId: 'parent',
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.vector }, nodesById, bounds)).toEqual([]);
  });

  it('should return no groups for a text-curves layer', () => {
    const node: TTextNode = {
      content: 'Hi',
      fill: '#000000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 16,
      height: 20,
      id: 'text',
      name: 'text',
      parentId: 'parent',
      rotation: 90,
      type: NodeType.text,
      width: 20,
      x: 170,
      y: 140,
    };

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.textCurves }, nodesById, bounds)).toEqual([]);
  });

  it('should return no groups for a raster layer', () => {
    expect(getSvgLayerAncestorGroups({ nodeIds: new Set(['x']), type: SvgLayerType.raster }, nodesById, bounds)).toEqual([]);
  });
});
