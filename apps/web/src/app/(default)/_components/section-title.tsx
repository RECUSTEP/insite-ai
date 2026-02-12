import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

const sectionTitleStyle = cva({
  base: {
    display: "block",
    width: "fit-content",
    fontSize: "lg",
    pb: 0.5,
    px: 1.5,
    borderLeft: "2px solid",
    borderBottom: "2px solid",
    borderColor: "accent",
  },
});

export const SectionTitle = styled("h2", sectionTitleStyle);
