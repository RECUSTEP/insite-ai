import { z } from "zod";

export const searchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(() => 1),
  text: z.string().optional(),
  column: z.string().optional(),
});

export const renderSearchParams = (param: z.infer<typeof searchParamsSchema>) => {
  const { page, column, text } = searchParamsSchema.parse(param);

  let searchParams = `/?page=${page}`;

  if (column && column.length >= 1) {
    searchParams += `&column=${column}`;
  }

  if (text && text.length >= 1) {
    searchParams += `&text=${text}`;
  }

  return searchParams;
};
