import imageCompression from "browser-image-compression";

// Comprime una foto en el navegador antes de subirla: la convierte a WebP
// (~25-30% más liviano que JPEG a igual calidad), máx ~250 KB y 1280px de
// lado mayor — suficiente para fotos de trabajos, ahorra storage y datos
// móviles. Si la compresión falla por algo, devuelve el archivo original.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8,
    });
  } catch {
    return file;
  }
}
