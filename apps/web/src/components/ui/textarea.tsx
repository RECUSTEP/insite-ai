"use client";

import { forwardRef, useCallback } from "react";
import { useEffect, useImperativeHandle, useRef } from "react";
import {
  Textarea as StyledTextarea,
  type TextareaProps as StyledTextareaProps,
} from "./styled/textarea";

export interface TextareaProps extends StyledTextareaProps {
  adjustHeight?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { adjustHeight, onChange, ...rest } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!adjustHeight || !textarea) {
      return;
    }
    textarea.style.height = "auto";
    const border = Number.parseInt(getComputedStyle(textarea).borderBlock, 10);
    const height = textarea.scrollHeight + border * 2;
    textarea.style.height = `${height}px`;
  }, [adjustHeight]);

  useEffect(() => {
    handleChange();
  }, [handleChange]);

  // biome-ignore lint/style/noNonNullAssertion: This is safe because the ref is always assigned
  useImperativeHandle(ref, () => textareaRef.current!);

  return (
    <StyledTextarea
      ref={textareaRef}
      bg="inputAreaBg"
      onChange={(e) => {
        handleChange();
        onChange?.(e);
      }}
      {...rest}
    />
  );
});
