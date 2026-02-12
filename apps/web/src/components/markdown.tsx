import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { css, cva, cx } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { code, link, table, text } from "styled-system/recipes";

type Props = {
  children: string;
};

export function MarkdownRenderer({ children }: Props) {
  return (
    <Box
      css={{
        "& > * + *": {
          mt: 4,
        },
      }}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </Box>
  );
}

const tableStyle = table({ variant: "outline" });

const listRecipe = cva({
  base: {
    ml: "6",
    "& > li::marker": {
      color: "fg.muted",
    },
    "& > li + li": {
      mt: "2",
    },
  },
  variants: {
    style: {
      disc: {
        listStyleType: "disc",
      },
      decimal: {
        listStyleType: "decimal",
      },
    },
  },
});

const components: Components = {
  h1: ({ node: _, ...props }) => (
    <h1
      {...props}
      className={cx(
        props?.className,
        text({ size: "3xl" }),
        css({ borderBottom: "1px solid", borderBottomColor: "border.muted", lineHeight: "loose" }),
      )}
    />
  ),
  h2: ({ node: _, ...props }) => (
    <h2
      {...props}
      className={cx(
        props?.className,
        text({ size: "2xl" }),
        css({ borderBottom: "1px solid", borderBottomColor: "border.muted", lineHeight: "loose" }),
      )}
    />
  ),
  h3: ({ node: _, ...props }) => (
    <h3 {...props} className={cx(props?.className, text({ size: "xl" }))} />
  ),
  h4: ({ node: _, ...props }) => (
    <h4 {...props} className={cx(props?.className, text({ size: "lg" }))} />
  ),
  h5: ({ node: _, ...props }) => (
    <h5 {...props} className={cx(props?.className, text({ size: "md" }))} />
  ),
  h6: ({ node: _, ...props }) => (
    <h6 {...props} className={cx(props?.className, text({ size: "md" }))} />
  ),
  code: ({ node: _, ...props }) => (
    <code {...props} className={cx(props?.className, code(), css({ mx: 0.5 }))} />
  ),
  pre: ({ node: _, ...props }) => <pre {...props} />,
  table: ({ node: _, ...props }) => (
    <table {...props} className={cx(props?.className, tableStyle.root)} />
  ),
  thead: ({ node: _, ...props }) => (
    <thead {...props} className={cx(props?.className, tableStyle.head)} />
  ),
  tr: ({ node: _, ...props }) => <tr {...props} className={cx(props?.className, tableStyle.row)} />,
  th: ({ node: _, ...props }) => (
    <th {...props} className={cx(props?.className, tableStyle.header)} />
  ),
  tbody: ({ node: _, ...props }) => (
    <tbody {...props} className={cx(props?.className, tableStyle.body)} />
  ),
  td: ({ node: _, ...props }) => (
    <td {...props} className={cx(props?.className, tableStyle.cell)} />
  ),
  ul: ({ node: _, ...props }) => (
    <ul {...props} className={cx(props?.className, listRecipe({ style: "disc" }))} />
  ),
  ol: ({ node: _, ...props }) => (
    <ol {...props} className={cx(props?.className, listRecipe({ style: "decimal" }))} />
  ),
  a: (props) => <a {...props} className={cx(props?.className, link())} />,
  hr: ({ node: _, ...props }) => (
    <hr
      {...props}
      className={cx(
        css({
          my: 2,
        }),
        props.className,
      )}
    />
  ),
};
