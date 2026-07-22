"use client";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Portal } from "@ark-ui/react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  CHAT_GPT_MODEL_OPTIONS,
  type ChatGptModel,
  applicationSettingSchema,
  chatGptModelSchema,
} from "api/schema";
import { CheckCircleIcon, ChevronDownIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import {
  type OpenAiConnectionTestResult,
  saveApplicationSettingAction,
  testOpenAiConnectionAction,
} from "../_actions/save-application-setting";

type Schema = z.infer<typeof applicationSettingSchema>;
type Props = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
};

export function SaveApplicationSettingForm({ defaultValue }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [lastResult, formAction] = useFormState(saveApplicationSettingAction, {});
  const defaultModel = chatGptModelSchema.safeParse(defaultValue?.chatGptModel);
  const [chatGptModel, setChatGptModel] = useState<ChatGptModel>(
    defaultModel.success ? defaultModel.data : "gpt-4o-mini",
  );
  const [connectionResult, setConnectionResult] = useState<OpenAiConnectionTestResult>();
  const [isTestingConnection, startConnectionTest] = useTransition();
  const [metaInsight, setMetaInsight] = useState(defaultValue?.metaInsightEnabled === "true");
  const [metaSocialChat, setMetaSocialChat] = useState(
    defaultValue?.metaSocialChatEnabled === "true",
  );
  const [metaAccountLink, setMetaAccountLink] = useState(
    defaultValue?.metaAccountLinkEnabled === "true",
  );
  const [form, fields] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: applicationSettingSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleConnectionTest = () => {
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    setConnectionResult(undefined);
    startConnectionTest(async () => {
      setConnectionResult(await testOpenAiConnectionAction(formData));
    });
  };

  return (
    <form
      ref={formRef}
      className={stack({ gap: 6 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      <input type="hidden" name="metaInsightEnabled" value={metaInsight ? "true" : "false"} />
      <input type="hidden" name="metaSocialChatEnabled" value={metaSocialChat ? "true" : "false"} />
      <input
        type="hidden"
        name="metaAccountLinkEnabled"
        value={metaAccountLink ? "true" : "false"}
      />
      <section className={stack({ gap: 6 })}>
        <Text as="h2" size="lg">
          ChatGPT設定
        </Text>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.openAiApiKey.errors?.length}>
          <Field.Label>OpenAI APIキー</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.openAiApiKey.key}
              name={fields.openAiApiKey.name}
              type="password"
              autoComplete="off"
              defaultValue={fields.openAiApiKey.initialValue}
              placeholder="sk-..."
            />
          </Field.Input>
          <Field.HelperText>
            保存済みのキーは表示されません。変更する場合のみ新しいキーを入力してください。
          </Field.HelperText>
          {fields.openAiApiKey.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.chatGptModel.errors?.length}>
          <Field.Label>ChatGPTモデル</Field.Label>
          <Select.Root
            items={[...CHAT_GPT_MODEL_OPTIONS]}
            name={fields.chatGptModel.name}
            value={[chatGptModel]}
            onValueChange={(event) => {
              const parsed = chatGptModelSchema.safeParse(event.value[0]);
              if (parsed.success) {
                setChatGptModel(parsed.data);
                setConnectionResult(undefined);
              }
            }}
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
                <Select.Indicator>
                  <ChevronDownIcon />
                </Select.Indicator>
              </Select.Trigger>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  <Select.ItemGroup>
                    <Select.ItemGroupLabel>利用するモデル</Select.ItemGroupLabel>
                    {CHAT_GPT_MODEL_OPTIONS.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.ItemGroup>
                </Select.Content>
              </Select.Positioner>
            </Portal>
            <Select.HiddenSelect />
          </Select.Root>
          {fields.chatGptModel.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <HStack alignItems="center" gap={3} flexWrap="wrap">
          <Button
            type="button"
            variant="outline"
            loading={isTestingConnection}
            loadingText={isTestingConnection ? "接続確認中..." : undefined}
            onClick={handleConnectionTest}
          >
            接続テスト
          </Button>
          {connectionResult ? (
            <Text
              size="sm"
              role={connectionResult.ok ? "status" : "alert"}
              className={css({ color: connectionResult.ok ? "accent.default" : "fg.error" })}
            >
              {connectionResult.message}
            </Text>
          ) : (
            <Text size="sm" className={css({ color: "text.secondary" })}>
              保存済みAPIキーで認証とモデルの利用可否を確認します。
            </Text>
          )}
        </HStack>
      </section>

      <section className={stack({ gap: 4 })}>
        <Text as="h2" size="lg">
          Meta / Instagram・Threads 連携
        </Text>
        <Text size="sm" className={css({ color: "text.secondary" })}>
          ユーザー画面の分析AI（Meta インサイト・チャット・連携）の表示と API
          の利用可否を制御します。OAuth 実装後に連携フローを接続してください。
        </Text>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox
            checked={metaInsight}
            onCheckedChange={(d) => setMetaInsight(d.checked === true)}
          >
            Instagram・Threads インサイト分析タブを有効化
          </Checkbox>
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox
            checked={metaSocialChat}
            onCheckedChange={(d) => setMetaSocialChat(d.checked === true)}
          >
            Meta 連携チャットを有効化
          </Checkbox>
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox
            checked={metaAccountLink}
            onCheckedChange={(d) => setMetaAccountLink(d.checked === true)}
          >
            アカウント連携（OAuth）を有効化
          </Checkbox>
        </Field.Root>
      </section>

      <Box
        data-invalid={form.errors?.length ? "" : undefined}
        className={css({
          textAlign: "right",
          fontSize: "sm",
          display: "none",
          "&[data-invalid]": {
            display: "block",
            color: "fg.error",
          },
        })}
      >
        {form.errors?.map((error) => (
          <span key={error}>{error}</span>
        ))}
      </Box>
      <HStack ml="auto">
        <CheckCircleIcon
          size={18}
          data-type={lastResult.status}
          className={css({
            display: "none",
            "&[data-type=success]": {
              display: "block",
              color: "accent.default",
            },
          })}
        />
        <SubmitButton>保存</SubmitButton>
      </HStack>
    </form>
  );
}
