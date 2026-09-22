// others
import { EXPORT_FORMAT_MIME_TYPE, EXPORT_JPEG_QUALITY, EXPORT_MIN_VECTOR_RASTER_SCALE } from '../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality } from '../enums';
import { TDraftRect } from 'types/canvas';
import { TExportFile } from '../types';

// utils
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { createPdfBlob } from './pdf/createPdfBlob';
import { createSvgBlob } from './svg/createSvgBlob/createSvgBlob';
import { getColorProfileTarget } from './getColorProfileTarget';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const createExportFile = async (
  nodeId: string | null,
  format: ExportFormat,
  scale: number,
  fileName: string,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  colorProfile: ExportColorProfile,
  jpegQuality: ExportQuality,
  bounds: TDraftRect,
  outlineText: boolean,
  includeIdAttribute: boolean,
): Promise<TExportFile | null> => {
  switch (format) {
    case ExportFormat.pdf: {
      const pdfBlob = await createPdfBlob(
        nodeId,
        Math.max(scale, EXPORT_MIN_VECTOR_RASTER_SCALE),
        ignoreOverlappingLayers,
        imageResampling,
        EXPORT_JPEG_QUALITY[jpegQuality],
        outlineText,
        bounds,
      );
      return pdfBlob ? { blob: pdfBlob, fileName } : null;
    }
    case ExportFormat.svg: {
      const svgBlob = await createSvgBlob(
        nodeId,
        Math.max(scale, EXPORT_MIN_VECTOR_RASTER_SCALE),
        ignoreOverlappingLayers,
        imageResampling,
        EXPORT_JPEG_QUALITY[jpegQuality],
        outlineText,
        includeIdAttribute,
        bounds,
      );
      return svgBlob ? { blob: svgBlob, fileName } : null;
    }
    default: {
      const rendered = await renderNodeForExport(nodeId, scale, ignoreOverlappingLayers, imageResampling, undefined, bounds);

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
    }
  }
};
