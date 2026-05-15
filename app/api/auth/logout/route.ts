import { deleteSession } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-helpers";

export async function POST() {
  await deleteSession();
  return jsonSuccess({ message: "Logged out successfully" });
}
