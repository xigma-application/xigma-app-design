// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from '../enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode, TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

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

const vector = (id: string): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id,
  name: id,
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
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
  it('should merge consecutive non-text nodes into one raster layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), rectangle('b')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['a', 'b'], nodeIds: new Set(['a', 'b']), type: SvgLayerType.raster }]);
  });

  it('should split raster layers around a real text layer to keep the paint order', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), text('t'), rectangle('b')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: text('t'), type: SvgLayerType.text },
      { contextIds: ['a', 't', 'b'], nodeIds: new Set(['b']), type: SvgLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible rectangle into its own vector layer between raster layers', () => {
    // action
    const layers = getSvgLayers(
      [frame('f'), rectangle('r'), rectangle('s')],
      () => true,
      (node) => node.id === 'r',
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['f'], nodeIds: new Set(['f']), type: SvgLayerType.raster },
      { node: rectangle('r'), type: SvgLayerType.vector },
      { contextIds: ['f', 'r', 's'], nodeIds: new Set(['s']), type: SvgLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible ellipse into its own vector layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), ellipse('e')],
      () => true,
      (node) => node.type === NodeType.ellipse,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: ellipse('e'), type: SvgLayerType.vector },
    ]);
  });

  it('should turn a vector-eligible line into its own vector layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), line('l')],
      () => true,
      (node) => node.type === NodeType.line,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: line('l'), type: SvgLayerType.vector },
    ]);
  });

  it('should turn a vector-eligible pen-tool vector node into its own vector layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), vector('vec')],
      () => true,
      (node) => node.type === NodeType.vector,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: vector('vec'), type: SvgLayerType.vector },
    ]);
  });

  it('should send a frame that cannot be vector into the raster layer', () => {
    // action
    const layers = getSvgLayers(
      [frame('f')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['f'], nodeIds: new Set(['f']), type: SvgLayerType.raster }]);
  });

  it('should keep a text node that cannot be real text or vector curves inside the raster layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), text('t')],
      (node: TTextNode) => node.id !== 't',
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['a', 't'], nodeIds: new Set(['a', 't']), type: SvgLayerType.raster }]);
  });

  it('should turn a text node that cannot be real text but can be vector curves into its own textCurves layer', () => {
    // action
    const layers = getSvgLayers(
      [rectangle('a'), text('t'), rectangle('b')],
      () => false,
      () => false,
      (node: TTextNode) => node.id === 't',
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: SvgLayerType.raster },
      { node: text('t'), type: SvgLayerType.textCurves },
      { contextIds: ['a', 't', 'b'], nodeIds: new Set(['b']), type: SvgLayerType.raster },
    ]);
  });

  it('should set contextIds to every node seen so far, including earlier vector-eligible siblings, not just this raster layer own nodeIds', () => {
    // mock — a raster node (e.g. one with a Glass/blur effect) needs the real backdrop it's already
    // sitting on top of to render correctly, even when that backdrop is otherwise vector-eligible and
    // exported as its own separate vector layer
    const layers = getSvgLayers(
      [rectangle('backdrop'), rectangle('glass')],
      () => true,
      (node) => node.id === 'backdrop',
      () => false,
    );

    // result
    expect(layers).toEqual([
      { node: rectangle('backdrop'), type: SvgLayerType.vector },
      { contextIds: ['backdrop', 'glass'], nodeIds: new Set(['glass']), type: SvgLayerType.raster },
    ]);
  });

  it('should prefer real text over vector curves when a text node qualifies for both', () => {
    // action
    const layers = getSvgLayers(
      [text('t')],
      () => true,
      () => false,
      () => true,
    );

    // result
    expect(layers).toEqual([{ node: text('t'), type: SvgLayerType.text }]);
  });
});
