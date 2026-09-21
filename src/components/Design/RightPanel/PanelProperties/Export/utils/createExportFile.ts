// others
import { EXPORT_FORMAT_MIME_TYPE, EXPORT_JPEG_QUALITY, PDF_MIN_RASTER_SCALE } from '../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality } from '../enums';
import { TExportFile } from '../types';

// utils
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { createPdfBlob } from './pdf/createPdfBlob';
import { getColorProfileTarget } from './getColorProfileTarget';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const createExportFile = async (
  nodeId: string,
  format: ExportFormat,
  scale: number,
  fileName: string,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  colorProfile: ExportColorProfile,
  jpegQuality: ExportQuality,
): Promise<TExportFile | null> => {
  if (format === ExportFormat.pdf) {
    const pdfBlob = await createPdfBlob(nodeId, Math.max(scale, PDF_MIN_RASTER_SCALE), ignoreOverlappingLayers, imageResampling);
    return pdfBlob ? { blob: pdfBlob, fileName } : null;
  }

  const rendered = await renderNodeForExport(nodeId, scale, ignoreOverlappingLayers, imageResampling);

  if (rendered) {
    const quality = format === ExportFormat.jpeg ? EXPORT_JPEG_QUALITY[jpegQuality] : undefined;
    const blob = await createImageBlobFromPixels(
      rendered.pixels,
      rendered.width,
      rendered.height,
      EXPORT_FORMAT_MIME_TYPE[format],
      quality,
      getColorProfileTarget(colorProfile),
    );

    if (blob) {
      return { blob, fileName };
    }
  }

  return null;
};
