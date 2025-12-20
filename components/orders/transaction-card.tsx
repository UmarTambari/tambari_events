// components/orders/transaction-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, CheckCircle2 } from "lucide-react";

interface TransactionCardProps {
  transaction: {
    id: string;
    reference: string;
    provider: string;
    amount: number;
    status: string;
    channel?: string;
    cardType?: string;
    lastFourDigits?: string;
    bank?: string;
    paidAt: Date | null;
  };
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-[#85A947]/30">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-white border-[#85A947]/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#123524] flex items-center justify-between">
          <span>Transaction Details</span>
          {getStatusBadge(transaction.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#85A947] mb-1">Reference</p>
            <p className="text-sm font-mono font-medium text-[#123524]">
              {transaction.reference}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#85A947] mb-1">Provider</p>
            <p className="text-sm font-medium text-[#123524] capitalize">
              {transaction.provider}
            </p>
          </div>
        </div>

        {transaction.channel && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#85A947] mb-1">Payment Method</p>
              <p className="text-sm font-medium text-[#123524] capitalize">
                {transaction.channel}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#85A947] mb-1">Amount</p>
              <p className="text-sm font-medium text-[#123524]">
                ₦{(transaction.amount / 100).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {transaction.cardType && transaction.lastFourDigits && (
          <div className="p-3 rounded-lg bg-[#EFE3C2]/30 border border-[#85A947]/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#3E7B27]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#123524] capitalize">
                  {transaction.cardType} Card
                </p>
                <p className="text-xs text-[#85A947]">
                  •••• •••• •••• {transaction.lastFourDigits}
                </p>
              </div>
            </div>
          </div>
        )}

        {transaction.bank && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#85A947]" />
            <div>
              <p className="text-xs text-[#85A947]">Bank</p>
              <p className="text-sm font-medium text-[#123524]">
                {transaction.bank}
              </p>
            </div>
          </div>
        )}

        {transaction.paidAt && (
          <div className="pt-3 border-t border-[#85A947]/20">
            <p className="text-xs text-[#85A947]">Payment Date</p>
            <p className="text-sm font-medium text-[#123524] mt-1">
              {transaction.paidAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}