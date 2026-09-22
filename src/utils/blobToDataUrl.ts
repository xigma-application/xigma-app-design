export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (): void => resolve(reader.result as string);
    reader.onerror = (): void => reject(reader.error);
    reader.readAsDataURL(blob);
  });
