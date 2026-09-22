import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";

const baseInputClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";

const errorInputClasses =
  "border-red-300 focus:border-red-500 focus:ring-red-500/20";

interface WrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: WrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  id,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <input
        id={id}
        aria-invalid={!!error}
        className={`${baseInputClasses} ${error ? errorInputClasses : ""} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  error,
  id,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  id: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <textarea
        id={id}
        aria-invalid={!!error}
        className={`${baseInputClasses} ${error ? errorInputClasses : ""} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  id,
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  id: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <select
        id={id}
        aria-invalid={!!error}
        className={`${baseInputClasses} bg-white ${error ? errorInputClasses : ""} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="mt-0.5 h-4 w-4 shrink-0"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
