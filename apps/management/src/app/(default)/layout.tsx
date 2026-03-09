import { Flex } from "styled-system/jsx";
import { Sidebar } from "./_components/sidebar";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Flex direction="column" flex="1" minW={0}>
        {children}
        {modal}
      </Flex>
    </Flex>
  );
}
