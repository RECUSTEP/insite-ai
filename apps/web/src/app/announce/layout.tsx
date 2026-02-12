import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "styled-system/jsx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container maxW="3xl" my={8}>
      <Button asChild variant="ghost" mb={4} px={2} ml={-2} color="fg.muted">
        <Link href="/">
          <ArrowLeftIcon />
          戻る
        </Link>
      </Button>
      {children}
    </Container>
  );
}
