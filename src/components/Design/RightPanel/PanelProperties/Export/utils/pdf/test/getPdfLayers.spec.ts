// types
import { NodeType } from 'types/design/enums';
import { PdfLayerType } from '../enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { getPdfLayers } from '../getPdfLayers';

const rectangle = (id: string): TSceneNode => ({
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
    const layers = getPdfLayers([rectangle('a'), rectangle('b')], () => true);

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 'b']), type: PdfLayerType.raster }]);
  });

  it('should split raster layers around a real text layer to keep the paint order', () => {
    // action
    const layers = getPdfLayers([rectangle('a'), text('t'), rectangle('b')], () => true);

    // result
    expect(layers).toEqual([
      { nodeIds: new Set(['a']), type: PdfLayerType.raster },
      { node: text('t'), type: PdfLayerType.text },
      { nodeIds: new Set(['b']), type: PdfLayerType.raster },
    ]);
  });

  it('should keep a text node that cannot be real text inside the raster layer', () => {
    // action
    const layers = getPdfLayers([rectangle('a'), text('t')], (node: TTextNode) => node.id !== 't');

    // result
    expect(layers).toEqual([{ nodeIds: new Set(['a', 't']), type: PdfLayerType.raster }]);
  });
});
