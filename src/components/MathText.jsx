'use client';

import React from "react";
import "katex/dist/katex.min.css";
// Import default sebagai TeX (atau Math)
import TeX from "@matejmazur/react-katex";

export default function MathText({ text }) {
  if (!text) return null;

  // Split teks berdasarkan delimiter $$ (block) dan $ (inline)
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/gs);

  return (
    <span>
      {parts.map((part, index) => {
        // Render Block Math ($$...$$)
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const content = part.slice(2, -2).trim();
          return <TeX key={index} math={content} block />;
        }
        
        // Render Inline Math ($...$)
        if (part.startsWith("$") && part.endsWith("$")) {
          const content = part.slice(1, -1).trim();
          return <TeX key={index} math={content} />;
        }

        // Teks biasa
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}