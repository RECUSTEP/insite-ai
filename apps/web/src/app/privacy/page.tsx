"use client";

import { PRIVACY_POLICY } from "@/app/_components/legal-documents";
import { LegalPage } from "@/app/_components/legal-page";

export default function PrivacyPage() {
  return <LegalPage title="プライバシーポリシー" body={PRIVACY_POLICY} />;
}
