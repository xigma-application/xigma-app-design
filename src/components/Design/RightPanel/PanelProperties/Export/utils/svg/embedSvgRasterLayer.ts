// types
import { ExportImageResampling } from '../../enums';
import { TDraftRect } from 'types/canvas';

// utils
import { blobToDataUrl } from 'utils/blobToDataUrl';
import { createImageBlobFromPixels } from 'utils/canvas/createImageBlobFromPixels';
import { flattenPixelsToOpaqueWhite } from '../flattenPixelsToOpaqueWhite';
import { formatSvgNumber } from './formatSvgNumber';
import { renderNodeForExport } from 'utils/canvas/exportRender/exportRenderRegistry';

export const embedSvgRasterLayer = async (
  elements: string[],
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
    const dataUrl = await blobToDataUrl(blob);

    elements.push(
      `<image href="${dataUrl}" x="0" y="0" width="${formatSvgNumber(bounds.width)}" height="${formatSvgNumber(bounds.height)}"/>`,
    );
  }
};
