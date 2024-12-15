import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function GET() {
//   const supabase = createClient();
//   const { data: blogPosts } = await supabase
//     .from("blog_posts")
//     .select(
//       "id, title, subtitle, markdown_ai_revision, created_at, status, markdown, ai_publishing_recommendations"
//     )
//     .order("created_at", { ascending: false });

await inngest.send({
    name: "blog-post.new",
    data: {
      email: "testUser@example.com",
    },
  });


  return NextResponse.json({ test:"ok" });
}
