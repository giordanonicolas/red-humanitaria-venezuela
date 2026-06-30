import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type PublicSchema = Database['public'];
type IsExtending = PublicSchema['Tables']['centros']['Insert'] extends Record<string, unknown> ? "YES" : "NO";
const x: IsExtending = "YES";

async function testInsert() {
  const client = createClient();
  const centrosTable = client.from("centros");
  type InsertType = typeof centrosTable extends { insert: (values: infer T) => any } ? T : "NOT FOUND";
  const y: InsertType = null as any;
  return y;
}
