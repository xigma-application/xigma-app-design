// assets
import pointerCursorUrl from 'assets/icons/cursors/pointer.png';

const COMPOSITE_SIZE_PX = 512;
const CROSSHAIR_SIZE_PX = 256;
const THUMBNAIL_MAX_SIZE_PX = 256;
const THUMBNAIL_OFFSET_PX = 192;
const BADGE_COLOR = '#FF0000';
const BADGE_RADIUS_PX = 84;
// only needed when a badge is actually drawn, to keep its circle clear of the crosshair's "+" glyph
const THUMBNAIL_OFFSET_WITH_BADGE_PX = THUMBNAIL_OFFSET_PX + BADGE_RADIUS_PX / 2;
const BADGE_FONT = 'bold 92px sans-serif';
const BADGE_TEXT_COLOR = '#FFFFFF';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const image = new Image();

    image.onload = (): void => resolve(image);
    image.src = src;
  });

const drawBadge = (context: CanvasRenderingContext2D, center: number, badgeCount: number): void => {
  context.beginPath();
  context.arc(center, center, BADGE_RADIUS_PX, 0, Math.PI * 2);
  context.fillStyle = BADGE_COLOR;
  context.fill();

  context.font = BADGE_FONT;
  context.fillStyle = BADGE_TEXT_COLOR;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(badgeCount), center, center);
};

export const createArmedCursor = (imageSrc: string, badgeCount: number, onReady: (cursorValue: string) => void): void => {
  Promise.all([loadImage(pointerCursorUrl), loadImage(imageSrc)]).then(([crosshair, thumbnail]) => {
    const canvas = document.createElement('canvas');

    canvas.width = COMPOSITE_SIZE_PX;
    canvas.height = COMPOSITE_SIZE_PX;

    const context = canvas.getContext('2d');

    if (context) {
      const hasBadge = badgeCount > 1;
      const offset = hasBadge ? THUMBNAIL_OFFSET_WITH_BADGE_PX : THUMBNAIL_OFFSET_PX;
      const scale = Math.min(THUMBNAIL_MAX_SIZE_PX / thumbnail.naturalWidth, THUMBNAIL_MAX_SIZE_PX / thumbnail.naturalHeight);

      context.drawImage(crosshair, 0, 0, CROSSHAIR_SIZE_PX, CROSSHAIR_SIZE_PX);
      context.drawImage(thumbnail, offset, offset, thumbnail.naturalWidth * scale, thumbnail.naturalHeight * scale);

      if (hasBadge) {
        drawBadge(context, offset, badgeCount);
      }

      onReady(`-webkit-image-set(url(${canvas.toDataURL()}) 8x) 16 16, auto`);
    }
  });
};
