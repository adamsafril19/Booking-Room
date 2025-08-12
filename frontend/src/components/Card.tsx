import React from "react";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Komponen Card yang telah ditingkatkan.
 * - Menggunakan 'shadow' yang lebih lembut sebagai default.
 * - Menggunakan 'border-slate-200' agar lebih cocok dengan tema.
 * - Padding default dihilangkan agar lebih fleksibel, bisa diatur per-instance.
 * - Ditambahkan transisi untuk efek hover yang mulus.
 */
const Card: React.FC<CardProps> = ({ className = "", children, ...rest }) => {
  return (
    <div
      className={`bg-white shadow hover:shadow-md border border-slate-200 rounded-lg transition-all duration-300 p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
