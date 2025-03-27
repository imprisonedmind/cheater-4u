export const fetchSupabase = ({
  query = "",
  cache = "force-cache",
  revalidate = 300, // for testing we may want to up this in prod
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
