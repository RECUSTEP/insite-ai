import { MarkdownRenderer } from "@/components/markdown";
import { Text, type TextProps } from "@/components/ui/text";
import { aiTypeMap } from "@/constants/api";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

type Props = {
  id: string;
};

export async function HistoryDetail({ id }: Props) {
  const client = createClient();
  const result = await client.history[":id"].$get(
    {
      param: { id },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch history");
  }

  const history = await result.json();

  return (
    <>
      <div
        className={css({
          "& > * + *": {
            mt: 6,
          },
        })}
      >
        <Heading>AIの種類</Heading>
        <Text>{aiTypeMap[history.aiType]}</Text>
        <Heading>ご利用日</Heading>
        <Text>
          {new Date(history.createdAt).toLocaleString("ja", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </Text>
        <Heading>入力情報</Heading>
        <Box>
          {history.input.instruction && <Text>{history.input.instruction}</Text>}
          {history.input.image && (
            <img
              src={`/api/image/${history.input.image}`}
              alt=""
              className={css({
                w: "full",
                maxW: "sm",
                objectFit: "scale-down",
              })}
            />
          )}
        </Box>
        <Heading>出力情報</Heading>
        <MarkdownRenderer>{history.output.output}</MarkdownRenderer>
      </div>
    </>
  );
}

function Heading({ children, ...props }: TextProps) {
  return (
    <Text as="h2" size="lg" borderColor="brand.DEFAULT" borderBottom="3px solid" pb={1} {...props}>
      {children}
    </Text>
  );
}
