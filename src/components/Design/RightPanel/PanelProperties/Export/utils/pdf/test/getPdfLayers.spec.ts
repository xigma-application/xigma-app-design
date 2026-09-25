// types
import { NodeType } from 'types/design/enums';
import { PdfLayerType } from '../enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode, TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getPdfLayers } from '../getPdfLayers';

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

const rectangle = (id: string): TFrameNode | (TRectangleNode & TSceneNode) => ({
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
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
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

describe('getPdfLayers', () => {
  it('should merge consecutive non-text nodes into one raster layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), rectangle('b')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['a', 'b'], nodeIds: new Set(['a', 'b']), type: PdfLayerType.raster }]);
  });

  it('should split raster layers around a real text layer to keep the paint order', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), text('t'), rectangle('b')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: text('t'), type: PdfLayerType.text },
      { contextIds: ['a', 't', 'b'], nodeIds: new Set(['b']), type: PdfLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible rectangle into its own vector layer between raster layers', () => {
    // action
    const layers = getPdfLayers(
      [frame('f'), rectangle('r'), rectangle('s')],
      () => true,
      (node) => node.id === 'r',
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['f'], nodeIds: new Set(['f']), type: PdfLayerType.raster },
      { node: rectangle('r'), type: PdfLayerType.vector },
      { contextIds: ['f', 'r', 's'], nodeIds: new Set(['s']), type: PdfLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible ellipse into its own vector layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), ellipse('e')],
      () => true,
      (node) => node.type === NodeType.ellipse,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: ellipse('e'), type: PdfLayerType.vector },
    ]);
  });

  it('should turn a vector-eligible line into its own vector layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), line('l')],
      () => true,
      (node) => node.type === NodeType.line,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: line('l'), type: PdfLayerType.vector },
    ]);
  });

  it('should turn a vector-eligible pen-tool vector node into its own vector layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), vector('vec')],
      () => true,
      (node) => node.type === NodeType.vector,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: vector('vec'), type: PdfLayerType.vector },
    ]);
  });

  it('should send a frame that cannot be vector into the raster layer', () => {
    // action
    const layers = getPdfLayers(
      [frame('f')],
      () => true,
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['f'], nodeIds: new Set(['f']), type: PdfLayerType.raster }]);
  });

  it('should keep a text node that cannot be real text or vector curves inside the raster layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), text('t')],
      (node: TTextNode) => node.id !== 't',
      () => false,
      () => false,
    );

    // result
    expect(layers).toEqual([{ contextIds: ['a', 't'], nodeIds: new Set(['a', 't']), type: PdfLayerType.raster }]);
  });

  it('should turn a text node that cannot be real text but can be vector curves into its own textCurves layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), text('t'), rectangle('b')],
      () => false,
      () => false,
      (node: TTextNode) => node.id === 't',
    );

    // result
    expect(layers).toEqual([
      { contextIds: ['a'], nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: text('t'), type: PdfLayerType.textCurves },
      { contextIds: ['a', 't', 'b'], nodeIds: new Set(['b']), type: PdfLayerType.raster },
    ]);
  });

  it('should set contextIds to every node seen so far, including earlier vector-eligible siblings, not just this raster layer own nodeIds', () => {
    // mock — a raster node (e.g. one with a Glass/blur effect) needs the real backdrop it's already
    // sitting on top of to render correctly, even when that backdrop is otherwise vector-eligible and
    // exported as its own separate vector layer
    const layers = getPdfLayers(
      [rectangle('backdrop'), rectangle('glass')],
      () => true,
      (node) => node.id === 'backdrop',
      () => false,
    );

    // result
    expect(layers).toEqual([
      { node: rectangle('backdrop'), type: PdfLayerType.vector },
      { contextIds: ['backdrop', 'glass'], nodeIds: new Set(['glass']), type: PdfLayerType.raster },
    ]);
  });

  it('should prefer real text over vector curves when a text node qualifies for both', () => {
    // action
    const layers = getPdfLayers(
      [text('t')],
      () => true,
      () => false,
      () => true,
    );

    // result
    expect(layers).toEqual([{ node: text('t'), type: PdfLayerType.text }]);
  });
});
