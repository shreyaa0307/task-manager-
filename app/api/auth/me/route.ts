import { requireAuth, jsonSuccess } from "@/lib/api-helpers";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  return jsonSuccess(user);
}
