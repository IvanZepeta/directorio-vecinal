import imageCompression from "browser-image-compression";

// Comprime y convierte la foto a WebP estático en el navegador.
// El canvas siempre produce UN solo cuadro, así que de un GIF o "foto en
// movimiento" se extrae automáticamente una imagen fija. Si el archivo no
// es una imagen que el navegador pueda decodificar (un video, por ejemplo),
// lanza un error con mensaje claro para que el formulario lo muestre.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Solo se permiten fotos fijas (JPG, PNG o WebP), no videos ni fotos en movimiento.",
    );
  }

  try {
    return await imageCompression(file, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8,
    });
  } catch {
    throw new Error(
      "No se pudo procesar esta foto. Intenta con una imagen normal (JPG o PNG).",
    );
  }
}
