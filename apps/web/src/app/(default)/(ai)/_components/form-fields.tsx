import { toaster } from "@/app/_components/toast";
import { MarkdownRenderer } from "@/components/markdown";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { PROJECT_TAG } from "@/lib/tags";
import { fileUpload } from "@repo/configuration";
import type { analysisQuerySchema } from "api/schema";
import { Copy } from "lucide-react";
import {
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";
import type { z } from "zod";
import { revalidateTagAction } from "../../_action/revalidate";
import { SectionTitle } from "../../_components/section-title";
import { FileUpload as BaseFileUpload } from "./file-upload";
import { ToneStyleSelect } from "./tone-style-select";

const cardCss = css({
  bg: "bg.card",
  border: "1px solid",
  borderColor: { base: "#E4E4E7", _dark: "#27272A" },
  borderRadius: "12px",
  p: 6,
});

const { acceptExtensions, maxFileSizeMb } = fileUpload;

const FormContext = createContext<{
  output: string;
  loading: boolean;
  setOutput: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  option: z.infer<typeof analysisQuerySchema>;
}>({
  output: "",
  loading: false,
  setOutput: () => undefined,
  setLoading: () => undefined,
  option: {
    type: "market",
  },
});

export type RootProps = {
  children: React.ReactNode;
  option: z.infer<typeof analysisQuerySchema>;
};

export function Root({ option, children }: RootProps) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <FormContext.Provider
      value={{
        output: output,
        loading: loading,
        setOutput,
        setLoading,
        option,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

async function* readStream(stream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder("utf-8");
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value);
  }
}

class AnalysisKnownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisKnownError";
  }
}

const parseErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as {
      error?: unknown;
      message?: unknown;
      details?: unknown;
    };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
    if (data.details) {
      return "文字数基準未達です。再生成をお試しください。";
    }
  } catch {
    return "エラーが発生しました。";
  }
  return "エラーが発生しました。";
};

export type FormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  files?: File[];
};

export function Form({ children, ...props }: FormProps) {
  const { setLoading, setOutput, output, option } = useContext(FormContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOutput("");
    setLoading(true);
    try {
      const query = new URLSearchParams({ type: option.type });
      const form = new FormData(e.currentTarget);
      for (const file of props.files ?? []) {
        form.append("images", file);
      }
      const response = await fetch(`/api/analysis?${query.toString()}`, {
        method: "POST",
        body: form,
      });
      if (!response.ok || response.body === null) {
        if (response.status === 403) {
          const errorMsg = await parseErrorMessage(response);
          throw new AnalysisKnownError(errorMsg);
        }
        throw new AnalysisKnownError(await parseErrorMessage(response));
      }
      for await (const chunk of readStream(response.body)) {
        setOutput((prev) => prev + chunk);
      }
      // ストリーム完了後（=API側で createApiUsage がコミット済み）に
      // キャッシュを再検証してプロジェクト使用量を最新化する
      revalidateTagAction(PROJECT_TAG);
    } catch (e) {
      const msg = e instanceof AnalysisKnownError ? e.message : "エラーが発生しました。";
      toaster.error({
        title: "エラー",
        description: msg,
      });
    }
    setLoading(false);
  };

  const shouldScroll = (() => {
    if (typeof document === "undefined") {
      return false;
    }
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    return scrollHeight - scrollTop - clientHeight < 20;
  })();

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (shouldScroll) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  }, [output]);

  return (
    <form onSubmit={handleSubmit} className={`${cardCss} ${props.className ?? ""}`} {...props}>
      {option.type !== "seo-article" && (
        <Stack gap={2} mb={4}>
          <Field.Root>
            <Field.Label>出力のトーン</Field.Label>
            <ToneStyleSelect />
          </Field.Root>
        </Stack>
      )}
      {children}
    </form>
  );
}

const errorMessageMap = new Map<string, string>([
  ["TOO_MANY_FILES", "1つのファイルのみ選択してください"],
  ["FILE_INVALID_TYPE", `${acceptExtensions.join(", ")}形式の画像を選択してください`],
  ["FILE_TOO_LARGE", `${maxFileSizeMb}MBを超えています`],
  ["FILE_TOO_SMALL", "ファイルサイズが小さすぎます"],
  ["FILE_INVALID", "ファイルが正しくありません"],
]);

export function FileUpload(props: ComponentProps<typeof BaseFileUpload>) {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  return (
    <Field.Root invalid={!!errorMessages.length}>
      <BaseFileUpload
        required
        {...props}
        onFileReject={(details) => setErrorMessages(details.files.flatMap((file) => file.errors))}
      />
      {errorMessages.map((msg) => (
        <Field.ErrorText key={msg}>{errorMessageMap.get(msg) ?? msg}</Field.ErrorText>
      ))}
    </Field.Root>
  );
}

export function Instruction(props: TextareaProps) {
  return <Textarea rows={5} resize="none" adjustHeight name="instruction" {...props} />;
}

export function GenerateButton({ children, ...props }: ButtonProps) {
  const { loading } = useContext(FormContext);

  return (
    <Button type="submit" loading={loading} {...props}>
      {children ?? "生成"}
    </Button>
  );
}

type OutputBlock = {
  title: string;
  body: string;
};

const proposalHeadingRegex =
  /^(?:#{1,6}\s*)?(?:[-*]\s*)?(?:\*\*)?(?:[【\[(（]?\s*)?(?:(?:投稿文|キャプション|フィード投稿|Threads投稿)?(?:案|パターン|候補)\s*(?:その)?[0-9０-９一二三A-CＡ-Ｃ]+|[0-9０-９一二三]+\s*(?:案目|つ目)|[0-9０-９]+\s*[.)．、]\s*(?:投稿文|キャプション|フィード投稿|Threads投稿)?(?:案|パターン|候補))(?:\s*[】\])）]?)?(?:\s*[:：.)、．-])?\s*(.*?)(?:\*\*)?$/;

function normalizeGeneratedTitle(line: string, index: number) {
  const trimmed = line
    .trim()
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/^[【\[(（]\s*/, "")
    .replace(/\s*[】\])）]$/, "")
    .trim();

  return trimmed || `案 ${index + 1}`;
}

function splitGeneratedOutput(output: string): OutputBlock[] {
  const lines = output.replace(/\r\n/g, "\n").split("\n");
  const blocks: OutputBlock[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  const pushCurrent = () => {
    const body = currentLines.join("\n").trim();
    if (!body) {
      return;
    }
    blocks.push({
      title: currentTitle || `案 ${blocks.length + 1}`,
      body,
    });
  };

  for (const line of lines) {
    const isProposalHeading = proposalHeadingRegex.test(line.trim());
    if (isProposalHeading) {
      pushCurrent();
      currentTitle = normalizeGeneratedTitle(line, blocks.length);
      currentLines = [];
      continue;
    }
    currentLines.push(line);
  }
  pushCurrent();

  if (blocks.length >= 2) {
    return blocks;
  }

  return [
    {
      title: "生成結果",
      body: output.trim(),
    },
  ];
}

function CopyButton({ text, children }: { text: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip.Root open={isOpen}>
      <Tooltip.Trigger asChild>
        <Button
          size="sm"
          variant="outline"
          w="fit-content"
          onClick={() => {
            navigator.clipboard.writeText(text);
            setIsOpen(true);
            setTimeout(() => setIsOpen(false), 1000);
          }}
        >
          {children}
          <Copy size={14} />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          コピーしました
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}

function OutputContent() {
  const { loading, output } = useContext(FormContext);

  if (loading && !output) {
    return (
      <Stack>
        <Skeleton h="4" />
        <Skeleton h="4" />
        <Skeleton h="4" />
        <Skeleton h="4" />
      </Stack>
    );
  }

  if (!output) {
    return null;
  }

  const outputBlocks = splitGeneratedOutput(output);
  const hasMultipleBlocks = outputBlocks.length > 1;

  return (
    <Stack gap={3}>
      {hasMultipleBlocks && <CopyButton text={output}>全文をコピーする</CopyButton>}
      {outputBlocks.map((block, index) => (
        <Box
          key={`${block.title}-${index}`}
          css={{
            border: "1px solid",
            borderColor: { base: "#E4E4E7", _dark: "#27272A" },
            borderRadius: "10px",
            bg: { base: "#FFFFFF", _dark: "#18181B" },
            p: 4,
          }}
        >
          <Stack gap={3}>
            <Box
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <h3
                className={css({
                  color: "fg.default",
                  fontSize: "md",
                  fontWeight: 700,
                  lineHeight: "1.5",
                })}
              >
                {hasMultipleBlocks ? block.title : "生成結果"}
              </h3>
              <CopyButton text={block.body}>
                {hasMultipleBlocks ? `${block.title}をコピー` : "結果をコピーする"}
              </CopyButton>
            </Box>
            <MarkdownRenderer>{block.body}</MarkdownRenderer>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

/** カードなし — 後方互換のため残す（OutputSection 推奨） */
export function Output() {
  return <OutputContent />;
}

export function OutputSection({ title = "生成結果" }: { title?: string }) {
  const { output, loading } = useContext(FormContext);

  if (!output && !loading) {
    return null;
  }

  return (
    <Box className={cardCss}>
      <Stack gap={4}>
        <SectionTitle>{title}</SectionTitle>
        <OutputContent />
      </Stack>
    </Box>
  );
}
