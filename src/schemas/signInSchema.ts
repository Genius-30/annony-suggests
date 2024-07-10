import { z } from "zod";

export const singInSchema = z.object({
  username: z.string(),
  password: z.string(),
});
