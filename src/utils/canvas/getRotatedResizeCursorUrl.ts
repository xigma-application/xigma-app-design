// assets
import resizeCursorUrl from 'assets/icons/cursors/resize.png';

const CURSOR_SIZE_PX = 32;
const HALF_CURSOR_SIZE_PX = CURSOR_SIZE_PX / 2;

let resizeCursorImage: HTMLImageElement | null = null;
const cursorUrlByAngle = new Map<number, string>();

const getResizeCursorImage = (): HTMLImageElement => {
  if (!resizeCursorImage) {
    resizeCursorImage = new Image();
    resizeCursorImage.src = resizeCursorUrl;
  }

  return resizeCursorImage;
};

export const getRotatedResizeCursorUrl = (angle: number): string | null => {
  const image = getResizeCursorImage();

  if (!image.complete) {
    return null;
  }

  const cached = cursorUrlByAngle.get(angle);

  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');

  canvas.width = CURSOR_SIZE_PX;
  canvas.height = CURSOR_SIZE_PX;

  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.translate(HALF_CURSOR_SIZE_PX, HALF_CURSOR_SIZE_PX);
  context.rotate((angle * Math.PI) / 180);
  context.drawImage(image, -HALF_CURSOR_SIZE_PX, -HALF_CURSOR_SIZE_PX, CURSOR_SIZE_PX, CURSOR_SIZE_PX);

  const url = `url(${canvas.toDataURL()}) 16 16, auto`;

  cursorUrlByAngle.set(angle, url);

  return url;
};
