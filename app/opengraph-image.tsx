import { brandImage, OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/share";

// Preview genérico al compartir cualquier página del sitio. Las fichas lo
// reemplazan con el suyo (app/proveedor/[id]/opengraph-image.tsx).
export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return brandImage();
}
