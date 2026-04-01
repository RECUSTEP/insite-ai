/** application_settings のキー（camelCase） */
export const META_SETTING_KEYS = {
  insight: "metaInsightEnabled",
  socialChat: "metaSocialChatEnabled",
  accountLink: "metaAccountLinkEnabled",
} as const;

export type MetaFeatureFlags = {
  metaInsightEnabled: boolean;
  metaSocialChatEnabled: boolean;
  metaAccountLinkEnabled: boolean;
};

export function parseAppSettingBool(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export function metaFeatureFlagsFromSettings(
  rows: { key: string; value: string }[],
): MetaFeatureFlags {
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    metaInsightEnabled: parseAppSettingBool(map[META_SETTING_KEYS.insight]),
    metaSocialChatEnabled: parseAppSettingBool(map[META_SETTING_KEYS.socialChat]),
    metaAccountLinkEnabled: parseAppSettingBool(map[META_SETTING_KEYS.accountLink]),
  };
}
