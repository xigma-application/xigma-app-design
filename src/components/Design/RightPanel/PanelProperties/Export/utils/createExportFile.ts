// others
import { EXPORT_FORMAT_MIME_TYPE, EXPORT_JPEG_QUALITY } from '../constants';

// types
import { ExportFormat, ExportImageResampling } from '../enums';
import { TExportFile } from '../types';

// utils
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const createExportFile = async (
  nodeId: string,
  format: ExportFormat,
  scale: number,
  fileName: string,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
): Promise<TExportFile | null> => {
  const rendered = await renderNodeForExport(nodeId, scale, ignoreOverlappingLayers, imageResampling);

  if (rendered) {
    const quality = format === ExportFormat.jpeg ? EXPORT_JPEG_QUALITY : undefined;
    const blob = await createImageBlobFromPixels(
      rendered.pixels,
      rendered.width,
      rendered.height,
      EXPORT_FORMAT_MIME_TYPE[format],
      quality,
    );

    if (blob) {
      return { blob, fileName };
    }
  }

  return null;
};
