import { revalidate_time } from "@/lib/utils";

export const fetchSupabase = ({
  query = "",
  cache = "force-cache",
  revalidate = revalidate_time, // for testing we may want to up this in prod
}: {
  query?: string;
  cache?: RequestCache;
  revalidate?: number | false;
}) => {
  const supabaseApiKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseApiKey) {
    throw new Error("Supabase API key is not defined");
  }
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${query}`, {
    headers: {
      apiKey: supabaseApiKey,
    },
    cache,
    next: {
      revalidate,
    },
  });
};

export async function mutateSupabase({
  method,
  query,
  body,
}: {
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  query: string;
  body?: any;
}) {
  const supabaseApiKey = process.env.SUPABASE_ANON_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseApiKey || !supabaseUrl) {
    throw new Error("Supabase credentials are not defined");
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    method,
    headers: {
      apikey: supabaseApiKey,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`[${res.status}] Supabase mutation error: ${errorText}`);
  }

  // Only parse response JSON if it exists
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  return null;
}
