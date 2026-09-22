import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFName } from 'pdf-lib';

// store
import { selectBackgroundPaint, selectNodes, selectRootOrder } from 'store/design/selectors';
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
import { drawPdfPageBackground } from './drawPdfPageBackground';
import { drawPdfShape } from './drawPdfShape';
import { drawPdfTextCurves } from './drawPdfTextCurves';
import { drawPdfTextNode } from './drawPdfTextNode';
import { embedPdfRasterLayer } from './embedPdfRasterLayer';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getPdfLayers } from './getPdfLayers';
import { getRenderOrderedNodes } from 'store/design/utils/getRenderOrderedNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { loadPdfFontBytes } from './loadPdfFontBytes';

type TPdfExportSource = { bounds: TDraftRect; nodes: TSceneNode[] };

const getPdfExportSource = (
  nodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
  ignoreOverlappingLayers: boolean,
  boundsOverride: TDraftRect | undefined,
): TPdfExportSource | null => {
  if (nodeId === null) {
    return boundsOverride
      ? { bounds: boundsOverride, nodes: getRenderOrderedNodes(rootOrder, nodesById).filter((node) => !node.hidden) }
      : null;
  }

  const node = nodesById[nodeId];
  return node
    ? {
        bounds: boundsOverride ?? getRotatedNodeBounds(node),
        nodes: getExportRenderNodes(nodeId, nodesById, rootOrder, ignoreOverlappingLayers),
      }
    : null;
};

export const createPdfBlob = async (
  nodeId: string | null,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  jpegQuality: number,
  outlineText: boolean = false,
  boundsOverride?: TDraftRect,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const source = getPdfExportSource(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers, boundsOverride);

  if (source) {
    const { bounds, nodes } = source;
    const pdfDocument = await PDFDocument.create();

    pdfDocument.registerFontkit(fontkit);

    const font = await pdfDocument.embedFont(await loadPdfFontBytes(), { subset: false });
    const fontCharacters = new Set(font.getCharacterSet());
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

    if (nodeId === null) {
      drawPdfPageBackground(page, bounds, selectBackgroundPaint(state));
    }

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
