import { drawFortune, getAlmanac } from "@/domain/almanac/daily";
import { json } from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const salt = Number(url.searchParams.get("salt") || "0") || 0;
  const almanac = getAlmanac();
  const fortune = drawFortune(new Date(), salt);
  return json({
    ok: true,
    almanac,
    fortune,
  });
}
