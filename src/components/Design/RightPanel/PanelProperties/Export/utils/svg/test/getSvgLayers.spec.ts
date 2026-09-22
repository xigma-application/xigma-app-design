// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from '../enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgLayers } from '../getSvgLayers';

const frame = (id: string): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const rectangle = (id: string): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const ellipse = (id: string): TEllipseNode => ({
  fill: '#ff0000',
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
});

const line = (id: string): TLineNode => ({
  id,
  name: id,
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
});

const text = (id: string): TSceneNode => ({
  content: 'a',
  fill: '#000000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 10,
  x: 0,
  y: 0,
});

describe('getSvgLayers', () => {
  it('should merge consecutive non-vector nodes into one raster layer', () => {
    // action
    const layers = getSvgLayers([rectangle('a'), rectangle('b')], () => false);

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 'b']), type: SvgLayerType.raster }]);
  });

  it('should turn a vector-eligible rectangle into its own vector layer between raster layers', () => {
    // action
    const layers = getSvgLayers([frame('f'), rectangle('r'), rectangle('s')], (node) => node.id === 'r');

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['f']), type: SvgLayerType.raster },
      { node: rectangle('r'), type: SvgLayerType.vector },
      { nodeIds: new Set(['s']), type: SvgLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible ellipse into its own vector layer', () => {
    // action
    const layers = getSvgLayers([rectangle('a'), ellipse('e')], (node) => node.type === NodeType.ellipse);

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: ellipse('e'), type: SvgLayerType.vector },
    ]);
  });

  it('should turn a vector-eligible line into its own vector layer', () => {
    // action
    const layers = getSvgLayers([rectangle('a'), line('l')], (node) => node.type === NodeType.line);

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: line('l'), type: SvgLayerType.vector },
    ]);
  });

  it('should send a frame that cannot be vector into the raster layer', () => {
    // action
    const layers = getSvgLayers([frame('f')], () => false);

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['f']), type: SvgLayerType.raster }]);
  });

  it('should send a text node (not a vector candidate in this stage) into the raster layer', () => {
    // action
    const layers = getSvgLayers([rectangle('a'), text('t')], () => false);

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 't']), type: SvgLayerType.raster }]);
  });
});
