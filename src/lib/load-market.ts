import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loadMarket = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { loadStudioMarket } = await import("./polymarket.server");
    return loadStudioMarket(data.url);
  });
