// types
import { BlendMode, NodeType } from 'types/design/enums';
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

const blendedParent: TFrameNode = { ...rotatedParent, blendMode: BlendMode.multiply, rotation: 0 };

const nodesById: Record<string, TSceneNode> = { parent: rotatedParent };
const blendedNodesById: Record<string, TSceneNode> = { parent: blendedParent };

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
      { id: 'parent|<g transform="rotate(90, 150, 150)">', markup: '<g transform="rotate(90, 150, 150)">' },
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
      { id: 'parent|<g transform="rotate(90, 150, 150)">', markup: '<g transform="rotate(90, 150, 150)">' },
    ]);
  });

  it('should return no groups for a baked-geometry vector layer (line) under a rotated-only ancestor', () => {
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

  it('should return no groups for a text-curves layer under a rotated-only ancestor', () => {
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

  it('should return no groups for a raster layer, regardless of ancestor rotation or blend mode', () => {
    expect(getSvgLayerAncestorGroups({ nodeIds: new Set(['x']), type: SvgLayerType.raster }, blendedNodesById, bounds)).toEqual([]);
  });

  it('should compute a blend-mode group for a baked-geometry vector layer (line), unlike rotation', () => {
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

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.vector }, blendedNodesById, bounds)).toEqual([
      {
        id: 'parent|<g style="mix-blend-mode: multiply; isolation: isolate">',
        markup: '<g style="mix-blend-mode: multiply; isolation: isolate">',
      },
    ]);
  });

  it('should compute a blend-mode group for a text-curves layer', () => {
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
      rotation: 0,
      type: NodeType.text,
      width: 20,
      x: 170,
      y: 140,
    };

    expect(getSvgLayerAncestorGroups({ node, type: SvgLayerType.textCurves }, blendedNodesById, bounds)).toEqual([
      {
        id: 'parent|<g style="mix-blend-mode: multiply; isolation: isolate">',
        markup: '<g style="mix-blend-mode: multiply; isolation: isolate">',
      },
    ]);
  });

  it('should combine both a transform and a blend style in one group for a box-model layer under a rotated, blended ancestor', () => {
    const rotatedAndBlendedParent: TFrameNode = { ...rotatedParent, blendMode: BlendMode.screen };
    const combinedNodesById: Record<string, TSceneNode> = { parent: rotatedAndBlendedParent };
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

    const groups = getSvgLayerAncestorGroups({ node, type: SvgLayerType.vector }, combinedNodesById, bounds);

    expect(groups).toHaveLength(1);
    expect(groups[0].markup).toBe('<g transform="rotate(90, 150, 150)" style="mix-blend-mode: screen; isolation: isolate">');
  });
});
