import React from "react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "tertiary"; // Ditambahkan variant 'tertiary'
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}) => {
  // Base style untuk semua tombol
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Style spesifik untuk setiap variant
  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    // Variant baru untuk link atau aksi minor
    tertiary:
      "bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
