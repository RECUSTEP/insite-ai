import { Button } from "@/components/ui/button";
import { FileUpload as StyledFileUpload } from "@/components/ui/file-upload";
import { Text } from "@/components/ui/text";
import { fileUpload } from "@repo/configuration";
import { ImageIcon } from "lucide-react";

const { acceptMimeTypes, maxFileSize } = fileUpload;

export function FileUpload(props: StyledFileUpload.RootProps) {
  return (
    <StyledFileUpload.Root
      locale="ja"
      maxFiles={10}
      maxFileSize={maxFileSize}
      accept={acceptMimeTypes}
      {...props}
    >
      <StyledFileUpload.Dropzone bg="inputAreaBg" py={8} minH="0" height="fit-content">
        <StyledFileUpload.Label
          display="flex"
          flexDir="column"
          alignItems="center"
          gap="1.5"
          color="accent.default"
        >
          <ImageIcon size={40} />
          <Text as="span" color="accent">
            <Text as="span" display="none" md={{ display: "inline" }}>
              ドロップして
            </Text>
            画像を追加
          </Text>
        </StyledFileUpload.Label>
        <StyledFileUpload.Trigger asChild>
          <Button>画像を選択</Button>
        </StyledFileUpload.Trigger>
      </StyledFileUpload.Dropzone>
      <StyledFileUpload.ItemGroup>
        <StyledFileUpload.Context>
          {({ acceptedFiles }) =>
            acceptedFiles.map((file, id) => (
              <StyledFileUpload.Item
                // biome-ignore lint/suspicious/noArrayIndexKey:
                key={id}
                file={file}
                gridTemplateColumns="auto"
                gridTemplateAreas="'preview' 'name' 'size'"
              >
                <StyledFileUpload.ItemPreview type="image/*" mb={4}>
                  <StyledFileUpload.ItemPreviewImage
                    aspectRatio="unset"
                    height="auto"
                    width="full"
                    maxWidth="sm"
                  />
                </StyledFileUpload.ItemPreview>
                <StyledFileUpload.ItemName />
                <StyledFileUpload.ItemSizeText />
              </StyledFileUpload.Item>
            ))
          }
        </StyledFileUpload.Context>
      </StyledFileUpload.ItemGroup>
      <StyledFileUpload.HiddenInput />
    </StyledFileUpload.Root>
  );
}
