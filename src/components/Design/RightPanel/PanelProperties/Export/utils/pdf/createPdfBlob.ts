import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFName } from 'pdf-lib';

// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../enums';
import { PdfLayerType } from './enums';
import { TDraftRect } from 'types/canvas';
import { TPdfShapeNode } from './types';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportShapeAsVector } from './canExportShapeAsVector';
import { canExportTextAsOutline } from '../canExportTextAsOutline';
import { canExportTextAsRealText } from './canExportTextAsRealText';
import { canExportTextOnPathAsVectorCurves } from '../canExportTextOnPathAsVectorCurves';
import { drawPdfShape } from './drawPdfShape';
import { drawPdfTextCurves } from './drawPdfTextCurves';
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
  outlineText: boolean = false,
  boundsOverride?: TDraftRect,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const node = nodesById[nodeId];

  if (node) {
    const bounds = boundsOverride ?? getRotatedNodeBounds(node);
    const pdfDocument = await PDFDocument.create();

    pdfDocument.registerFontkit(fontkit);

    const font = await pdfDocument.embedFont(await loadPdfFontBytes(), { subset: false });
    const fontCharacters = new Set(font.getCharacterSet());
    const nodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
    const layers = getPdfLayers(
      nodes,
      (textNode: TTextNode) => !outlineText && canExportTextAsRealText(textNode, nodesById, fontCharacters),
      (shapeNode: TPdfShapeNode) => canExportShapeAsVector(shapeNode, nodesById),
      (textNode: TTextNode) =>
        outlineText ? canExportTextAsOutline(textNode, nodesById, false) : canExportTextOnPathAsVectorCurves(textNode, nodesById, false),
    );
    const graphicsStates = new Map<number, PDFName>();
    const page = pdfDocument.addPage([bounds.width, bounds.height]);
    const isSoleRasterLayer = layers.length === 1 && layers[0].type === PdfLayerType.raster;

    for (const layer of layers) {
      switch (layer.type) {
        case PdfLayerType.text:
          drawPdfTextNode(page, font, layer.node, nodesById, bounds);
          break;
        case PdfLayerType.textCurves:
          await drawPdfTextCurves(page, layer.node, nodesById, bounds, graphicsStates);
          break;
        case PdfLayerType.vector:
          drawPdfShape(page, layer.node, nodesById, bounds, graphicsStates);
          break;
        default:
          await embedPdfRasterLayer(
            pdfDocument,
            page,
            nodeId,
            rasterScale,
            ignoreOverlappingLayers,
            imageResampling,
            layer.contextIds,
            bounds,
            isSoleRasterLayer,
            jpegQuality,
          );
          break;
      }
    }

    return new Blob([new Uint8Array(await pdfDocument.save())], { type: 'application/pdf' });
  }

  return null;
};
