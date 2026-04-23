"use client";

import { LegalDocuments } from "./legal-documents";
import { ToastProvider } from "./toast";

type ProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export function Provider({ children }: ProviderProps) {
  return (
    <>
      <ToastProvider />
      {children}
      <LegalDocuments />
    </>
  );
}
