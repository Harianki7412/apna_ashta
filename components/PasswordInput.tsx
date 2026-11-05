"use client";

import { useState } from "react";
import type { ChangeEventHandler } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  invalid?: boolean;
  describedBy?: string;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  className = "input",
  disabled = false,
  required = false,
  minLength,
  invalid = false,
  describedBy,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        required={required}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${className} pr-12${invalid ? " input-error" : ""}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        minLength={minLength}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
      >
        {visible ? (
          <EyeOff size={16} aria-hidden="true" />
        ) : (
          <Eye size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
