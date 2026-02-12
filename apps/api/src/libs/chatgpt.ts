import type {
  ApplicationSettingUseCase,
  ProjectInfoUseCase,
  PromptUseCase,
} from "@repo/module/service";
import { omit } from "es-toolkit";
import { encodeBase64 } from "hono/utils/encode";
import openAi from "openai";

export function replacePlaceholders(template: string, values: Record<string, string>) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return key in values ? values[key] ?? "" : match;
  });
}

export async function chatgpt(applicationSettings: ApplicationSettingUseCase<"d1">) {
  const settings = await applicationSettings.getApplicationSetting();
  if (!settings.ok) {
    throw new Error("Application settings not found");
  }
  const apiKey = settings.val.find((setting) => setting.key === "openAiApiKey")?.value;
  const model = settings.val.find((setting) => setting.key === "chatGptModel")?.value;
  if (!apiKey || !model || !apiKey.trim() || !model.trim()) {
    throw new Error("OpenAI API key or model not found");
  }
  const client = new openAi({
    apiKey,
  });
  return async function* (system: string, user: string, images?: File[]) {
    const systemMessage = {
      role: "system",
      content: system,
    } satisfies openAi.Chat.Completions.ChatCompletionSystemMessageParam;
    const userMessage = {
      role: "user",
      content: [{ type: "text", text: user } as openAi.Chat.Completions.ChatCompletionContentPart],
    } satisfies openAi.Chat.Completions.ChatCompletionUserMessageParam;
    images?.forEach(async (image) => {
      userMessage.content.push({
        type: "image_url",
        image_url: { url: `data:${image.type};base64,${encodeBase64(await image.arrayBuffer())}` },
      });
    });
    const stream = await client.chat.completions.create({
      model,
      messages: [systemMessage, userMessage],
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content ?? "";
    }
  };
}

export function getPrompt(
  promptUseCase: PromptUseCase<"d1">,
  projectInfoUseCase: ProjectInfoUseCase<"d1">,
) {
  return async (projectId: string, type: string, instruction?: string) => {
    const prompt = await promptUseCase.getPromptByAiType(type);
    if (!prompt.ok) {
      throw new Error("Prompt not found");
    }
    const projectInfo = await projectInfoUseCase.getProjectInfo({ projectId });
    const values = {
      ...(projectInfo.ok ? omit(projectInfo.val, ["id"]) : {}),
      instruction: instruction ?? "",
    };
    const isString = (v: unknown): v is string => typeof v === "string";
    const system = replacePlaceholders(prompt.val.system, filterObject(values, isString));
    const user = replacePlaceholders(prompt.val.user, filterObject(values, isString));
    return { system, user };
  };
}

function filterObject<T extends Record<string, unknown>, U>(
  obj: T,
  predicate: (value: unknown) => value is U,
) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => predicate(value))) as Record<
    string,
    U
  >;
}
