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
import { Stack } from "styled-system/jsx";
import type { z } from "zod";
import { revalidateTagAction } from "../../_action/revalidate";
import { FileUpload as BaseFileUpload } from "./file-upload";

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
      revalidateTagAction(PROJECT_TAG);
      for await (const chunk of readStream(response.body)) {
        setOutput((prev) => prev + chunk);
      }
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
    <form onSubmit={handleSubmit} {...props}>
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

export function Output() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <Stack>
      {output.length >= 1 && (
        <Tooltip.Root open={isOpen}>
          <Tooltip.Trigger>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(output);
                setIsOpen(true);
                setTimeout(() => {
                  setIsOpen(false);
                }, 1000);
              }}
            >
              結果をコピーする
              <Copy />
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
      )}
      <MarkdownRenderer>{output}</MarkdownRenderer>
    </Stack>
  );
}
