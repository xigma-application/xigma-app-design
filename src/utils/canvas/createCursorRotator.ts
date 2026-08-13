const CURSOR_SIZE_PX = 32;
const HALF_CURSOR_SIZE_PX = CURSOR_SIZE_PX / 2;

export const createCursorRotator = (imageSrc: string): ((angle: number) => string | null) => {
  let cursorImage: HTMLImageElement | null = null;
  const cursorUrlByAngle = new Map<number, string>();

  return (angle: number): string | null => {
    if (!cursorImage) {
      cursorImage = new Image();
      cursorImage.src = imageSrc;
    }

    const image = cursorImage;

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
};
