import { PDFDocument, PDFPage } from 'pdf-lib';

// types
import { ExportImageResampling } from '../../enums';
import { TDraftRect } from 'types/canvas';

// utils
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { flattenPixelsToOpaqueWhite } from '../flattenPixelsToOpaqueWhite';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const embedPdfRasterLayer = async (
  pdfDocument: PDFDocument,
  page: PDFPage,
  nodeId: string | null,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  contextIds: string[],
  bounds: TDraftRect,
  useJpeg: boolean,
  jpegQuality: number,
): Promise<void> => {
  const rendered = await renderNodeForExport(nodeId, rasterScale, ignoreOverlappingLayers, imageResampling, new Set(contextIds), bounds);
  const blob = rendered
    ? useJpeg
      ? await createImageBlobFromPixels(
          flattenPixelsToOpaqueWhite(rendered.pixels),
          rendered.width,
          rendered.height,
          'image/jpeg',
          jpegQuality,
        )
      : await createImageBlobFromPixels(rendered.pixels, rendered.width, rendered.height, 'image/png')
    : null;

  if (blob) {
    const image = useJpeg ? await pdfDocument.embedJpg(await blob.arrayBuffer()) : await pdfDocument.embedPng(await blob.arrayBuffer());
    page.drawImage(image, { height: bounds.height, width: bounds.width, x: 0, y: 0 });
  }
};
