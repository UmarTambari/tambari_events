import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface OrderSummaryCardProps {
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  paidAt: Date | null;
}

export function OrderSummaryCard({
  subtotal,
  serviceFee,
  totalAmount,
  paidAt,
}: OrderSummaryCardProps) {
  return (
    <Card className="bg-white border-[#85A947]/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#123524]">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#3E7B27]">Subtotal</span>
            <span className="font-medium text-[#123524]">
              ₦{(subtotal / 100).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#3E7B27]">Service Fee</span>
            <span className="font-medium text-[#123524]">
              ₦{(serviceFee / 100).toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-[#85A947]/20" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#123524]">Total</span>
            <span className="text-xl font-bold text-[#123524]">
              ₦{(totalAmount / 100).toLocaleString()}
            </span>
          </div>
        </div>

        {paidAt && (
          <div className="pt-4 border-t border-[#85A947]/20">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-green-600">Payment Received</p>
                <p className="text-[#85A947] text-xs mt-0.5">
                  {paidAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
