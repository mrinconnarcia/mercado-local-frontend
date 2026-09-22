import type { ReactNode } from "react";

const VALUE_PROPS = [
  {
    title: "Negocios verificados",
    description: "Comprá con la confianza de un mercado curado y confiable.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 4 6v6c0 4.5 3.4 7.9 8 9 4.6-1.1 8-4.5 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Cerca tuyo",
    description: "Descubrí productos y servicios de negocios en tu zona.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Todo en un lugar",
    description: "Pedidos, pagos y seguimiento, sin complicaciones.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
];

export function AuthShell({
  eyebrow,
  heading,
  subheading,
  formTitle,
  formSubtitle,
  children,
  footer,
}: {
  /** Texto corto opcional arriba del título del formulario (ej. "Paso 1 de 2") */
  eyebrow?: string;
  /** Título grande del panel de marca (izquierda, solo desktop) */
  heading: string;
  /** Copy de apoyo del panel de marca */
  subheading: string;
  /** Título del formulario (derecha) */
  formTitle: string;
  /** Copy de apoyo del formulario */
  formSubtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-neutral-50 lg:flex">
      {/* Panel de marca — visible desde lg hacia arriba */}
      <div className="relative hidden overflow-hidden bg-emerald-900 px-12 py-16 lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          <Logo className="text-white" />
        </div>

        <div className="relative max-w-sm">
          <p className="font-serif text-3xl leading-tight text-white">
            {heading}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-emerald-100/80">
            {subheading}
          </p>
        </div>

        <ul className="relative flex flex-col gap-5">
          {VALUE_PROPS.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-emerald-200">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-sm text-emerald-100/70">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Columna del formulario */}
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:justify-center lg:px-16 lg:py-16">
        <div className="mb-8 flex justify-center lg:hidden">
          <Logo className="text-emerald-800" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          {eyebrow ? (
            <p className="mb-2 text-sm font-medium text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-2xl text-neutral-900 sm:text-[28px]">
            {formTitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">{formSubtitle}</p>

          <div className="mt-7 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-900/5 sm:p-8">
            {children}
          </div>

          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-serif text-base font-semibold text-white">
        M
      </span>
      <span className="font-serif text-lg text-current">Local</span>
    </div>
  );
}