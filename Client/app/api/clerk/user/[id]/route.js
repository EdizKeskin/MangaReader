export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch user", details: text },
        { status: res.status }
      );
    }

    const user = await res.json();
    const displayName =
      user.username ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      (user.email_addresses?.[0]?.email_address ?? null);

    return NextResponse.json(
      {
        id: user.id,
        username: displayName,
        image_url: user.image_url ?? null,
      },
      {
        headers: {
          // cache at the edge for a short time
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 }
    );
  }
}


