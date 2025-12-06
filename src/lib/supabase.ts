import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<any, "public", any>;

let serviceClient: ServiceClient | null = null;

export function getServiceClient(): ServiceClient {
  if (serviceClient) {
    return serviceClient;
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables",
    );
  }

  serviceClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return serviceClient;
}

