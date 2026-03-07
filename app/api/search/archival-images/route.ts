import { NextResponse } from "next/server";
import { searchAllArchives } from "@/lib/archival";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, europeana = true, loc = true, wikimedia = true, limit = 20, photosOnly = false } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const { results, errors } = await searchAllArchives(query.trim(), {
      europeana,
      loc,
      wikimedia,
      limit,
      photosOnly,
    });

    return NextResponse.json({
      results,
      errors,
      total: results.length,
    });
  } catch (error: any) {
    console.error("Archival search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search archives" },
      { status: 500 }
    );
  }
}
