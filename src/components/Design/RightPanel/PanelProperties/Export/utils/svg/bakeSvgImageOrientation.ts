export const bakeSvgImageOrientation = (
  bitmap: ImageBitmap,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  width: number,
  height: number,
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (context) {
    context.translate(width / 2, height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  return Promise.resolve(null);
};
