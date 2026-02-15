import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { type ComponentProps, forwardRef } from "react";
import { css, cx } from "styled-system/css";

export interface CheckboxProps extends ComponentProps<typeof ArkCheckbox.Root> {}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <ArkCheckbox.Root
      ref={ref}
      className={cx(
        css({
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
        }),
        className,
      )}
      {...rest}
    >
      <ArkCheckbox.Control
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 5,
          height: 5,
          borderRadius: "sm",
          border: "1px solid",
          borderColor: "gray.300",
          bg: "white",
          cursor: "pointer",
          transition: "all 0.2s",
          _checked: {
            bg: "blue.600",
            borderColor: "blue.600",
            color: "white",
          },
          _hover: {
            borderColor: "blue.500",
          },
          _disabled: {
            opacity: 0.5,
            cursor: "not-allowed",
          },
        })}
      >
        <ArkCheckbox.Indicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={css({
              width: 3.5,
              height: 3.5,
            })}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {children && (
        <ArkCheckbox.Label
          className={css({
            fontSize: "sm",
            color: "text.primary",
            cursor: "pointer",
            _disabled: {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          })}
        >
          {children}
        </ArkCheckbox.Label>
      )}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
});

Checkbox.displayName = "Checkbox";
