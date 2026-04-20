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
    <Card className="bg-white border-dash-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
          <Ticket className="h-5 w-5 text-dash-accent" />
          Order Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-dash-border bg-dash-highlight/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-dash-ink">
                    {item.ticketTypeName}
                  </h4>
                  <span className="text-sm text-dash-accent">
                    × {item.quantity}
                  </span>
                </div>
                <p className="text-sm text-dash-muted">
                  ₦{(item.pricePerTicket / 100).toLocaleString()} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-dash-ink">
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
