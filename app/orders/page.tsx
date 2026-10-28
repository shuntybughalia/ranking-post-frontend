import type { Metadata } from "next";
import OrdersList from "./OrdersList";

export const metadata: Metadata = {
  title: "Orders",
  description: "View and manage your guest posting orders.",
  robots: { index: false },
};

export default function OrdersPage() {
  return (
    <>
      <section className="bg-navy px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">My Orders</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Track the status of your guest posting packages.
        </p>
      </section>
      <OrdersList />
    </>
  );
}
