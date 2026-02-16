"use client";

import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";
import { Text } from "@/components/ui/text";

interface FeatureCard {
  title: string;
  description: string;
}

interface FeaturesBentoProps {
  features: FeatureCard[];
}

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    strokeWidth="1"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

const CornerPlusIcons = () => (
  <>
    <Box
      className={css({
        position: "absolute",
        top: "-12px",
        left: "-12px",
        color: "text.primary",
      })}
    >
      <PlusIcon />
    </Box>
    <Box
      className={css({
        position: "absolute",
        top: "-12px",
        right: "-12px",
        color: "text.primary",
      })}
    >
      <PlusIcon />
    </Box>
    <Box
      className={css({
        position: "absolute",
        bottom: "-12px",
        left: "-12px",
        color: "text.primary",
      })}
    >
      <PlusIcon />
    </Box>
    <Box
      className={css({
        position: "absolute",
        bottom: "-12px",
        right: "-12px",
        color: "text.primary",
      })}
    >
      <PlusIcon />
    </Box>
  </>
);

const PlusCard = ({
  title,
  description,
}: FeatureCard) => {
  return (
    <Box
      className={css({
        position: "relative",
        border: "2px dashed",
        borderColor: "gray.300",
        borderRadius: "lg",
        p: 8,
        bg: "white",
        minH: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        _hover: {
          borderColor: "brand.primary",
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
        },
      })}
    >
      <CornerPlusIcons />
      <VStack gap={3} alignItems="flex-start" position="relative" zIndex={10}>
        <Text
          size="xl"
          className={css({
            fontWeight: 700,
            color: "text.primary",
          })}
        >
          {title}
        </Text>
        <Text
          className={css({
            color: "text.secondary",
            fontSize: "md",
            lineHeight: 1.8,
          })}
        >
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

export function FeaturesBento({ features }: FeaturesBentoProps) {
  return (
    <Box w="full">
      {/* Responsive Grid with specific layout */}
      <Box
        className={css({
          display: "grid",
          gridTemplateColumns: {
            base: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gridAutoRows: "auto",
          gap: 4,
          "& > :nth-child(1)": {
            gridColumn: { lg: "span 3" },
            gridRow: { lg: "span 2" },
          },
          "& > :nth-child(2)": {
            gridColumn: { lg: "span 2" },
            gridRow: { lg: "span 2" },
          },
          "& > :nth-child(3)": {
            gridColumn: { lg: "span 4" },
            gridRow: { lg: "span 1" },
          },
          "& > :nth-child(4)": {
            gridColumn: { lg: "span 2" },
            gridRow: { lg: "span 1" },
          },
          "& > :nth-child(5)": {
            gridColumn: { lg: "span 2" },
            gridRow: { lg: "span 1" },
          },
          "& > :nth-child(6)": {
            gridColumn: { lg: "span 3" },
            gridRow: { lg: "span 1" },
          },
          "& > :nth-child(7)": {
            gridColumn: { lg: "span 3" },
            gridRow: { lg: "span 1" },
          },
        })}
      >
        {features.map((feature, index) => (
          <PlusCard key={index} {...feature} />
        ))}
      </Box>

      {/* Section Footer Heading */}
      <Flex
        justify="flex-end"
        className={css({
          maxW: "2xl",
          ml: "auto",
          textAlign: "right",
          px: 4,
          mt: { base: 6, lg: "-80px" },
        })}
      >
        <VStack gap={4} alignItems="flex-end">
          <Text
            className={css({
              fontSize: { base: "2xl", md: "4xl" },
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.2,
            })}
          >
            パフォーマンスのために構築。柔軟性のために設計。
          </Text>
          <Text
            className={css({
              color: "text.secondary",
              fontSize: "lg",
              lineHeight: 1.7,
            })}
          >
            INSITE AIは、美しく高性能なビジネスツールを素早く構築できるよう設計されています。各機能は、柔軟性、再利用性、アクセシビリティを考慮して丁寧に作られています。
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
}
