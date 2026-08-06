import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso de privacidad · Directorio vecinal",
  description:
    "Qué datos recolecta el directorio vecinal, para qué se usan, quién los ve y cómo pedir su corrección o eliminación.",
};

// Fecha de la última revisión del texto. Actualizar al editar el contenido.
const LAST_UPDATE = "6 de agosto de 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Aviso de privacidad
        </h1>
        <p className="text-xs text-zinc-500">
          Última actualización: {LAST_UPDATE}
        </p>
      </header>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Este directorio es un proyecto vecinal sin fines de lucro: sirve para que
        los vecinos encontremos proveedores de servicios recomendados por otros
        vecinos. Aquí te explicamos qué datos guardamos, para qué, quién los ve y
        cómo pedir que los corrijamos o los borremos.
      </p>

      <Section title="Quién es responsable de tus datos">
        <p>
          El vecino que administra el Directorio Vecinal de{" "}
          <strong>Sector Francés</strong> mantiene este directorio. Es un
          proyecto vecinal, sin fines de lucro y sin empresa detrás.
        </p>
        <p>
          Cualquier tema sobre tus datos —consultarlos, corregirlos o pedir que
          los borremos— trátalo directamente con el administrador del directorio
          y lo revisamos contigo.
        </p>
      </Section>

      <Section title="Si eres vecino y creas una cuenta">
        <p>Al registrarte pedimos cuatro datos, y tu correo al iniciar sesión:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Correo electrónico</strong> — es tu forma de entrar (te
            mandamos un enlace de acceso, no usamos contraseñas).
          </li>
          <li>
            <strong>Nombre</strong> — para que otros vecinos sepan quién
            recomienda un servicio.
          </li>
          <li>
            <strong>Teléfono y privada o calle</strong> — únicamente para que el
            administrador confirme que efectivamente vives en el
            fraccionamiento. No se usan para nada más.
          </li>
          <li>
            <strong>Fraccionamiento</strong> — para mostrarte el directorio que
            te corresponde.
          </li>
        </ul>
      </Section>

      <Section title="Quién ve cada dato">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Tu teléfono y tu calle: solo el administrador.</strong> Ningún
            otro vecino los ve, ni aparecen en ninguna página pública. La base de
            datos impide leerlos a cualquiera que no seas tú o el administrador.
          </li>
          <li>
            <strong>Tu correo: nadie más que tú.</strong> Vive en el sistema de
            acceso y la aplicación no lo muestra en ninguna parte.
          </li>
          <li>
            <strong>Tu nombre: se muestra en las reseñas que escribas.</strong> Un
            vecino con sesión ve tu nombre completo; quien entre sin cuenta ve
            solo tus iniciales. Si no escribes reseñas, tu nombre no aparece en
            ningún lado.
          </li>
        </ul>
      </Section>

      <Section title="Si eres proveedor de servicios">
        <p>
          El directorio publica el <strong>nombre, el teléfono de WhatsApp</strong>{" "}
          y, cuando existe, la descripción del servicio y las zonas donde trabaja
          cada proveedor. Son datos de contacto de negocio y están visibles para
          cualquier persona que abra el sitio, sin necesidad de tener cuenta.
        </p>
        <p>
          Muchos de estos perfiles los dio de alta el administrador con la
          información que los propios proveedores compartieron en el grupo de
          vecinos.{" "}
          <strong>
            Si tu perfil está publicado y quieres corregirlo o que lo quitemos,
            dile al vecino que te recomendó, o a cualquier vecino del Sector
            Francés, que le avise al administrador del directorio.
          </strong>{" "}
          Lo hacemos sin que tengas que explicar el motivo ni crear una cuenta.
        </p>
        <p>
          También guardamos un <strong>conteo de cuántas veces</strong> se pulsó
          el botón de contacto de cada perfil, para saber qué servicios busca la
          comunidad. Es un número, no registramos quién hizo clic.
        </p>
      </Section>

      <Section title="Reseñas y fotos">
        <p>
          Las reseñas y las fotos que subas son públicas y quedan asociadas a tu
          nombre (o a tus iniciales, según lo explicado arriba). Puedes editarlas
          o borrarlas en cualquier momento desde el perfil del proveedor. El
          administrador puede ocultar contenido que resulte ofensivo o falso.
        </p>
      </Section>

      <Section title="Qué NO hacemos">
        <ul className="list-disc space-y-1 pl-5">
          <li>No vendemos ni compartimos tus datos con terceros.</li>
          <li>No hacemos publicidad ni te mandamos correos promocionales.</li>
          <li>
            No usamos cookies de rastreo ni herramientas de analítica de
            terceros. La única cookie que existe es la que mantiene tu sesión
            abierta.
          </li>
          <li>No pedimos datos de salud, financieros ni de identificación oficial.</li>
        </ul>
      </Section>

      <Section title="Dónde se guardan y por cuánto tiempo">
        <p>
          Los datos viven en Supabase (base de datos y almacenamiento de
          imágenes) y el sitio corre en Vercel, ambos proveedores de
          infraestructura contratados para este fin. Conservamos tu información
          mientras tu cuenta exista o mientras el directorio esté en operación.
          Si pides que borremos tu cuenta, se elimina.
        </p>
      </Section>

      <Section title="Cómo acceder, corregir o borrar tus datos">
        <p>
          Habla con el administrador del directorio y dinos qué necesitas. Puedes
          pedir:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Saber qué datos tuyos tenemos.</li>
          <li>Corregir algo que esté mal.</li>
          <li>Que borremos tu cuenta y tus datos.</li>
          <li>
            Que dejemos de usarlos para algo en particular, o retirar tu
            consentimiento.
          </li>
        </ul>
        <p>
          Si eres proveedor y solo quieres salir del directorio, basta con
          decirlo.
        </p>
      </Section>

      <Section title="Cambios a este aviso">
        <p>
          Si cambiamos algo, actualizamos la fecha del inicio de esta página. Si
          el cambio es importante, lo avisamos en el grupo de vecinos.
        </p>
      </Section>

      <p className="border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <Link href="/" className="text-emerald-600 hover:underline">
          ← Volver al directorio
        </Link>
      </p>
    </article>
  );
}
