import { sanityClient } from "@/app/lib/sanityClient";
import { NextRequest, NextResponse } from "next/server";

// Type-safe interfaces
interface DeleteContactRequest {
  id: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteContactRequest = await request.json();

    if (!body.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Contact ID is required" },
        { status: 400 },
      );
    }

    // Sanity se delete karein
    await sanityClient.delete(body.id);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Submission deleted successfully" },
      { status: 200 },
    );
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Delete Error:", errorMessage);

    return NextResponse.json<ApiResponse>(
      { success: false, message: "Failed to delete submission" },
      { status: 500 },
    );
  }
}
