import { type NextRequest, NextResponse } from "next/server";

const INNGEST_API_URL = "http://localhost:3001";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ debateId: string }> }) {
  try {
    const { debateId } = await params;

    const response = await fetch(`${INNGEST_API_URL}/api/enhanced-debate/${debateId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Debate not found" }, { status: 404 });
      }
      throw new Error("Failed to fetch debate status");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching debate status:", error);
    return NextResponse.json({ error: "Failed to fetch debate status" }, { status: 500 });
  }
}
