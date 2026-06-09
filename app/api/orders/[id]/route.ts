import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrders, updateOrderStatus } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const validStatuses: OrderStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status);
    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 },
    );
  }
}
