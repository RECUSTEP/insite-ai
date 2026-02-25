import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

const sectionTitleStyle = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "2",
    fontSize: "sm",
    fontWeight: "600",
    letterSpacing: "0.02em",
    color: "text.secondary",
    textTransform: "uppercase",
    _before: {
      content: '""',
      display: "block",
      width: "3px",
      height: "14px",
      borderRadius: "2px",
      bg: "brand.DEFAULT",
      flexShrink: 0,
    },
  },
});

export const SectionTitle = styled("h2", sectionTitleStyle);
