import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFName } from 'pdf-lib';

// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../enums';
import { PdfLayerType } from './enums';
import { TPdfShapeNode } from './types';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportShapeAsVector } from './canExportShapeAsVector';
import { canExportTextAsRealText } from './canExportTextAsRealText';
import { drawPdfShape } from './drawPdfShape';
import { drawPdfTextNode } from './drawPdfTextNode';
import { embedPdfRasterLayer } from './embedPdfRasterLayer';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getPdfLayers } from './getPdfLayers';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { loadPdfFontBytes } from './loadPdfFontBytes';

export const createPdfBlob = async (
  nodeId: string,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  jpegQuality: number,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const node = nodesById[nodeId];

  if (node) {
    const bounds = getRotatedNodeBounds(node);
    const pdfDocument = await PDFDocument.create();

    pdfDocument.registerFontkit(fontkit);

    const font = await pdfDocument.embedFont(await loadPdfFontBytes(), { subset: false });
    const fontCharacters = new Set(font.getCharacterSet());
    const nodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
    const layers = getPdfLayers(
      nodes,
      (textNode: TTextNode) => canExportTextAsRealText(textNode, nodesById, fontCharacters),
      (shapeNode: TPdfShapeNode) => canExportShapeAsVector(shapeNode, nodesById),
    );
    const graphicsStates = new Map<number, PDFName>();
    const page = pdfDocument.addPage([bounds.width, bounds.height]);
    const isSoleRasterLayer = layers.length === 1 && layers[0].type === PdfLayerType.raster;

    for (const layer of layers) {
      if (layer.type === PdfLayerType.text) {
        drawPdfTextNode(page, font, layer.node, bounds);
      } else if (layer.type === PdfLayerType.vector) {
        drawPdfShape(page, layer.node, nodesById, bounds, graphicsStates);
      } else {
        await embedPdfRasterLayer(
          pdfDocument,
          page,
          nodeId,
          rasterScale,
          ignoreOverlappingLayers,
          imageResampling,
          layer.nodeIds,
          bounds,
          isSoleRasterLayer,
          jpegQuality,
        );
      }
    }

    return new Blob([new Uint8Array(await pdfDocument.save())], { type: 'application/pdf' });
  }

  return null;
};
