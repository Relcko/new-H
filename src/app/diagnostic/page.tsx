"use client";

import dynamic from "next/dynamic";

const ShaderDiagnostic =
  process.env.NODE_ENV !== "production"
    ? dynamic(
        () =>
          import("@/components/dev/shader-diagnostic").then(
            (m) => m.ShaderDiagnostic,
          ),
        { ssr: false, loading: () => null },
      )
    : () => null;

export default function DiagnosticPage() {
  return <ShaderDiagnostic />;
}
