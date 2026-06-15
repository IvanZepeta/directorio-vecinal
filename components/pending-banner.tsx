export function PendingBanner({ name }: { name: string }) {
  const firstName = name.trim().split(" ")[0];
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
      <p className="font-medium text-amber-900 dark:text-amber-100">
        ¡Gracias, {firstName}! Recibimos tu registro 🎉
      </p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
        Un administrador del fraccionamiento lo revisará pronto. Mientras tanto
        puedes explorar el directorio; podrás recomendar proveedores y dejar
        reseñas en cuanto tu cuenta sea aprobada.
      </p>
    </div>
  );
}
