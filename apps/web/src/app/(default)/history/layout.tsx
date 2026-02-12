import type { Metadata } from "next";
import { Box } from "styled-system/jsx";

export const metadata: Metadata = {
  title: "利用履歴",
};

export default function Layout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <>
      <Box maxW="6xl" mx="auto">
        {children}
      </Box>
      {modal}
    </>
  );
}
