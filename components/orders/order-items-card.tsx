// components/orders/order-items-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

interface OrderItemsCardProps {
  items: Array<{
    id: string;
    ticketTypeName: string;
    pricePerTicket: number;
    quantity: number;
    subtotal: number;
  }>;
}

export function OrderItemsCard({ items }: OrderItemsCardProps) {
  return (
    <Card className="bg-white border-[#85A947]/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#123524] flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#85A947]" />
          Order Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-[#85A947]/20 bg-[#EFE3C2]/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-[#123524]">
                    {item.ticketTypeName}
                  </h4>
                  <span className="text-sm text-[#85A947]">
                    × {item.quantity}
                  </span>
                </div>
                <p className="text-sm text-[#3E7B27]">
                  ₦{(item.pricePerTicket / 100).toLocaleString()} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#123524]">
                  ₦{(item.subtotal / 100).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
