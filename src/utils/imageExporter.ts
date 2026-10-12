/**
 * Image and Spritesheet Exporter utilities
 */

export class ImageExporter {
  /**
   * Downloads a Canvas or ImageData as a PNG file.
   */
  public static downloadImageData(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    filename: string,
    scale = 1
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Create intermediate unscaled canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    const imgData = tempCtx.createImageData(width, height);
    imgData.data.set(data);
    tempCtx.putImageData(imgData, 0, 0);

    // Draw scaled
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  /**
   * Generates a horizontal spritesheet containing all frames.
   */
  public static exportSpritesheet(
    frames: Uint8ClampedArray[],
    frameW: number,
    frameH: number,
    filename: string,
    scale = 1
  ): void {
    const totalFrames = frames.length;
    const sheetW = frameW * totalFrames;
    const sheetH = frameH;

    const canvas = document.createElement('canvas');
    canvas.width = sheetW * scale;
    canvas.height = sheetH * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frameW;
    tempCanvas.height = frameH;
    const tempCtx = tempCanvas.getContext('2d')!;

    for (let i = 0; i < totalFrames; i++) {
      const imgData = tempCtx.createImageData(frameW, frameH);
      imgData.data.set(frames[i]);
      tempCtx.putImageData(imgData, 0, 0);

      ctx.drawImage(
        tempCanvas,
        0,
        0,
        frameW,
        frameH,
        i * frameW * scale,
        0,
        frameW * scale,
        frameH * scale
      );
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  /**
   * Downloads plain text (like shader files or json).
   */
  public static downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
