import "react";

declare const UNDEFINED_VOID_ONLY: unique symbol;
declare module "react" {
  // biome-ignore lint/suspicious/noConfusingVoidType: idk...
  type VoidOrUndefinedOnly = void | { [UNDEFINED_VOID_ONLY]: never };
}
