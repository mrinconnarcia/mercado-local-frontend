import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

const baseInputClasses =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

interface WrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: WrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function TextField({
  label,
  error,
  id,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <input id={id} className={`${baseInputClasses} ${className}`} {...rest} />
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  error,
  id,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <textarea id={id} className={`${baseInputClasses} ${className}`} {...rest} />
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
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <select id={id} className={`${baseInputClasses} bg-white ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>
  );
}