import { z } from "zod";

export const searchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(() => 1),
  text: z.string().optional(),
});

export const renderSearchParams = (param: z.infer<typeof searchParamsSchema>) => {
  const { page, text } = searchParamsSchema.parse(param);

  let searchParams = `/?page=${page}`;

  if (text && text.length >= 1) {
    searchParams += `&text=${encodeURIComponent(text)}`;
  }

  return searchParams;
};
