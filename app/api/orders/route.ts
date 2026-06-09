import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createOrder, getOrders, getOrdersByUser } from "@/lib/orders";
import { getMarketPackages } from "@/lib/market";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await getOrdersByUser(session.id);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required." },
        { status: 400 },
      );
    }

    const packages = await getMarketPackages();
    const pkg = packages.find((p) => p.id === packageId);

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 },
      );
    }

    const order = await createOrder({
      userId: session.id,
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 },
    );
  }
}
