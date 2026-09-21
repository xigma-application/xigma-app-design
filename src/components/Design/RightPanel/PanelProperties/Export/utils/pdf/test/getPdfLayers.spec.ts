// types
import { NodeType } from 'types/design/enums';
import { PdfLayerType } from '../enums';
import { TFrameNode, TRectangleNode, TSceneNode, TTextNode } from 'types/design/types';

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
    );

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 'b']), type: PdfLayerType.raster }]);
  });

  it('should split raster layers around a real text layer to keep the paint order', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), text('t'), rectangle('b')],
      () => true,
      () => false,
    );

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: text('t'), type: PdfLayerType.text },
      { nodeIds: new Set(['b']), type: PdfLayerType.raster },
    ]);
  });

  it('should turn a vector-eligible rectangle into its own vector layer between raster layers', () => {
    // action
    const layers = getPdfLayers(
      [frame('f'), rectangle('r'), rectangle('s')],
      () => true,
      (node) => node.id === 'r',
    );

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['f']), type: PdfLayerType.raster },
      { node: rectangle('r'), type: PdfLayerType.vector },
      { nodeIds: new Set(['s']), type: PdfLayerType.raster },
    ]);
  });

  it('should send a frame that cannot be vector into the raster layer', () => {
    // action
    const layers = getPdfLayers(
      [frame('f')],
      () => true,
      () => false,
    );

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['f']), type: PdfLayerType.raster }]);
  });

  it('should keep a text node that cannot be real text inside the raster layer', () => {
    // action
    const layers = getPdfLayers(
      [rectangle('a'), text('t')],
      (node: TTextNode) => node.id !== 't',
      () => false,
    );

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 't']), type: PdfLayerType.raster }]);
  });
});
