import { sanityClient } from "@/app/lib/sanityClient";
import { NextRequest, NextResponse } from "next/server";

type DeleteRequestBody = {
  id: string;
};

type DeleteResponseBody = {
  success: boolean;
  message: string;
};

export async function POST(request: NextRequest) {
  const body: DeleteRequestBody = await request.json();

  if (!body.id || typeof body.id !== "string") {
    const errorResponse: DeleteResponseBody = {
      success: false,
      message: "Invalid request. Missing order ID.",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    await sanityClient.delete(body.id);

    const successResponse: DeleteResponseBody = {
      success: true,
      message: "Order deleted successfully.",
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.log(error);
    const errorResponse: DeleteResponseBody = {
      success: false,
      message: "Failed to delete order. Check token permissions.",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
