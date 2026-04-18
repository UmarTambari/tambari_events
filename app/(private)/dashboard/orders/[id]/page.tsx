import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/orders/order-detail";
import { getOrderWithDetails } from "@/lib/queries/order.queries";
interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderWithDetails(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}