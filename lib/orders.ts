import "server-only";
import { readJson, writeJson } from "./db";
import type { Order, OrderStatus } from "./types";

const ORDERS_FILE = "orders.json";

export type { Order, OrderStatus };

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>(ORDERS_FILE, []);
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const orders = await getOrders();
  return orders
    .filter((o) => o.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export interface CreateOrderInput {
  userId: string;
  packageId: string;
  packageName: string;
  price: number;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orders = await getOrders();
  const now = new Date().toISOString();

  const order: Order = {
    id: crypto.randomUUID(),
    userId: input.userId,
    packageId: input.packageId,
    packageName: input.packageName,
    price: input.price,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  orders.push(order);
  await writeJson(ORDERS_FILE, orders);

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  await writeJson(ORDERS_FILE, orders);

  return orders[index];
}
