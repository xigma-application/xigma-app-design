import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFName } from 'pdf-lib';

// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../enums';
import { PdfLayerType } from './enums';
import { TFrameNode, TRectangleNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportShapeAsVector } from './canExportShapeAsVector';
import { canExportTextAsRealText } from './canExportTextAsRealText';
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { drawPdfShape } from './drawPdfShape';
import { drawPdfTextNode } from './drawPdfTextNode';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getPdfLayers } from './getPdfLayers';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { loadPdfFontBytes } from './loadPdfFontBytes';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const createPdfBlob = async (
  nodeId: string,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const node = nodesById[nodeId];

  if (node) {
    const bounds = getRotatedNodeBounds(node);
    const pdfDocument = await PDFDocument.create();

    pdfDocument.registerFontkit(fontkit);

    const font = await pdfDocument.embedFont(await loadPdfFontBytes(), { subset: true });
    const fontCharacters = new Set(font.getCharacterSet());
    const nodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
    const layers = getPdfLayers(
      nodes,
      (textNode: TTextNode) => canExportTextAsRealText(textNode, nodesById, fontCharacters),
      (shapeNode: TFrameNode | TRectangleNode) => canExportShapeAsVector(shapeNode, nodesById),
    );
    const graphicsStates = new Map<number, PDFName>();
    const page = pdfDocument.addPage([bounds.width, bounds.height]);

    for (const layer of layers) {
      if (layer.type === PdfLayerType.text) {
        drawPdfTextNode(page, font, layer.node, bounds);
      } else if (layer.type === PdfLayerType.vector) {
        drawPdfShape(page, layer.node, nodesById, bounds, graphicsStates);
      } else {
        const rendered = await renderNodeForExport(nodeId, rasterScale, ignoreOverlappingLayers, imageResampling, layer.nodeIds);
        const blob = rendered ? await createImageBlobFromPixels(rendered.pixels, rendered.width, rendered.height, 'image/png') : null;

        if (blob) {
          const image = await pdfDocument.embedPng(await blob.arrayBuffer());

          page.drawImage(image, { height: bounds.height, width: bounds.width, x: 0, y: 0 });
        }
      }
    }

    return new Blob([new Uint8Array(await pdfDocument.save())], { type: 'application/pdf' });
  }

  return null;
};
