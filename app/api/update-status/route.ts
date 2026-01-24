import { sanityClient } from "@/app/lib/sanityClient";
import { NextResponse } from "next/server";


export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    await sanityClient
      .patch(id)
      .set({ status: status })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sanity Update Error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}