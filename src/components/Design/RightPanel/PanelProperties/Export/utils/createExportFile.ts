// others
import { EXPORT_FORMAT_MIME_TYPE, EXPORT_JPEG_QUALITY } from '../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling } from '../enums';
import { TExportFile } from '../types';

// utils
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
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
): Promise<TExportFile | null> => {
  const colorProfileTarget = getColorProfileTarget(colorProfile);
  const rendered = await renderNodeForExport(nodeId, scale, ignoreOverlappingLayers, imageResampling, colorProfileTarget);

  if (rendered) {
    const quality = format === ExportFormat.jpeg ? EXPORT_JPEG_QUALITY : undefined;
    const blob = await createImageBlobFromPixels(
      rendered.pixels,
      rendered.width,
      rendered.height,
      EXPORT_FORMAT_MIME_TYPE[format],
      quality,
      colorProfileTarget,
    );

    if (blob) {
      return { blob, fileName };
    }
  }

  return null;
};
