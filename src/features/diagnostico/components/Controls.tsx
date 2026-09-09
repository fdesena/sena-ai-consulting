import { Check } from "lucide-react";
import type { Option } from "../types";
import { cn } from "@/lib/utils";

function ChoiceCard({
  type,
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-[72px] cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-colors",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#ba5017]",
        checked
          ? "border-[#b44a0f] bg-[#fff0e5] shadow-[inset_3px_0_0_#cf5d1c]"
          : "border-[#bfc6cc] bg-white/70 hover:border-[#888f96] hover:bg-white",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center border",
          type === "checkbox" ? "rounded" : "rounded-full",
          checked ? "border-[#b74e15] bg-[#bc5118]" : "border-[#929ba3] bg-white",
        )}
      >
        {checked && type === "radio" && <span className="h-2 w-2 rounded-full bg-white" />}
        {checked && type === "checkbox" && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <strong className="block text-[15px] font-medium leading-snug text-[#171a1d]">
          {label}
        </strong>
        {description ? (
          <small className="mt-1.5 block text-sm leading-snug text-[#626970]">{description}</small>
        ) : null}
      </span>
    </label>
  );
}

export function RadioCards({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-3", columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {options.map((opt) => (
        <ChoiceCard
          key={opt.value}
          type="radio"
          name={name}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          checked={value === opt.value}
          onChange={(checked) => checked && onChange(opt.value)}
        />
      ))}
    </div>
  );
}

export function CheckboxCards({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: Option[];
  value: string[];
  onChange: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-3", columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {options.map((opt) => (
        <ChoiceCard
          key={opt.value}
          type="checkbox"
          name={name}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          checked={value.includes(opt.value)}
          onChange={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

export function Fieldset({
  legend,
  hint,
  children,
}: {
  legend?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mb-6">
      {legend ? (
        <legend className="mb-2.5 block text-base font-medium text-[#171a1d]">{legend}</legend>
      ) : null}
      {hint ? <p className="mb-3 text-sm text-[#5e666c]">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

export function FieldSelect({
  id,
  label,
  options,
  value,
  onChange,
  optional = false,
}: {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div className="mb-6">
      <label htmlFor={`field-${id}`} className="mb-2.5 block text-base font-medium text-[#171a1d]">
        {label}{" "}
        {optional ? <span className="text-sm font-normal text-[#727a82]">· opcional</span> : null}
      </label>
      <select
        id={`field-${id}`}
        name={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="block min-h-12 w-full rounded-md border border-[#aeb7bf] bg-white px-3.5 py-3 text-[#1a1916] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba5017]"
      >
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FieldText({
  id,
  label,
  value,
  onChange,
  placeholder,
  long = false,
  optional = true,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  long?: boolean;
  optional?: boolean;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
}) {
  return (
    <div className="mb-6">
      <label htmlFor={`field-${id}`} className="mb-2.5 block text-base font-medium text-[#171a1d]">
        {label}{" "}
        {optional ? <span className="text-sm font-normal text-[#727a82]">· opcional</span> : null}
      </label>
      {long ? (
        <textarea
          id={`field-${id}`}
          name={id}
          maxLength={500}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block min-h-24 w-full resize-y rounded-md border border-[#aeb7bf] bg-white px-3.5 py-3 text-[#1a1916] placeholder:text-[#717981] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba5017]"
        />
      ) : (
        <input
          id={`field-${id}`}
          name={id}
          type={type}
          autoComplete={autoComplete}
          maxLength={180}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block min-h-12 w-full rounded-md border border-[#aeb7bf] bg-white px-3.5 py-3 text-[#1a1916] placeholder:text-[#717981] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba5017]"
        />
      )}
    </div>
  );
}

export function HelperNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 flex gap-3 border-l-2 border-[#b2bcc5] bg-[#e9ecee] px-4.5 py-4 text-[15px] text-[#4d5861]">
      <span>{children}</span>
    </div>
  );
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-md border px-5 py-3 text-[15px] leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function primaryButtonClass(className?: string) {
  return cn(
    buttonBase,
    "border-bronze bg-bronze text-[#121415] hover:bg-[#ff9558] hover:border-[#ff9558] focus-visible:outline-bronze",
    className,
  );
}

export function outlineDarkButtonClass(className?: string) {
  return cn(
    buttonBase,
    "border-white/35 bg-transparent text-current hover:bg-white/5 focus-visible:outline-bronze",
    className,
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={primaryButtonClass(className)} />;
}

export function OutlineButtonDark({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={outlineDarkButtonClass(className)} />;
}

export function TextButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-md border border-transparent px-2 text-[15px] text-current/70 transition-colors hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze disabled:opacity-40",
        className,
      )}
    />
  );
}
