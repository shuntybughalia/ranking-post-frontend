import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createOrder, getOrdersByUser } from "@/lib/orders";
import { getMarketPackages } from "@/lib/market";
import { withApiErrors } from "@/lib/api-handler";

async function handleGET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await getOrdersByUser(session.id);
  return NextResponse.json({ orders });
}

async function handlePOST(request: Request) {
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

export const GET = withApiErrors(handleGET);
export const POST = withApiErrors(handlePOST);
