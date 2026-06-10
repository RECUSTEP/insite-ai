"use client";

import { TERMS_OF_SERVICE } from "@/app/_components/legal-documents";
import { LegalPage } from "@/app/_components/legal-page";

export default function TermsPage() {
  return <LegalPage title="利用規約" body={TERMS_OF_SERVICE} />;
}
