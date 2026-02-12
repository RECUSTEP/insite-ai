import { Box } from "styled-system/jsx";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box maxW="5xl" mx="auto">
      {children}
    </Box>
  );
}
