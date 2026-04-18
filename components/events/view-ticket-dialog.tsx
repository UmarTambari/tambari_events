"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TicketType } from "@/lib/types/ticketTypes.type";

interface ViewTicketDialogProps {
  ticket: TicketType;
}

export function ViewTicketDialog({ ticket }: ViewTicketDialogProps) {
  const [open, setOpen] = useState(false);

  const soldPercentage = (ticket.quantitySold / ticket.quantity) * 100;
  const remaining = ticket.quantity - ticket.quantitySold;
  const revenue = (ticket.price * ticket.quantitySold) / 100;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#3E7B27] hover:bg-[#EFE3C2]"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl text-[#123524]">
                {ticket.name}
              </DialogTitle>
              <DialogDescription className="text-[#3E7B27] mt-1">
                Ticket type details and sales information
              </DialogDescription>
            </div>
            <Badge
              className={
                ticket.isActive
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }
            >
              {ticket.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4 -mx-6">
          {/* Description */}
          {ticket.description && (
            <div>
              <h3 className="text-sm font-semibold text-[#123524] mb-2">
                Description
              </h3>
              <p className="text-sm text-[#3E7B27]">{ticket.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-[#123524] mb-2">
              Pricing
            </h3>
            <div className="bg-[#EFE3C2]/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-[#123524]">
                ₦{(ticket.price / 100).toLocaleString()}
              </div>
              <p className="text-sm text-[#85A947] mt-1">per ticket</p>
            </div>
          </div>

          {/* Sales Statistics */}
          <div>
            <h3 className="text-sm font-semibold text-[#123524] mb-3">
              Sales Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Sold</p>
                <p className="text-2xl font-bold text-[#123524] mt-1">
                  {ticket.quantitySold}
                </p>
              </div>
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Remaining</p>
                <p className="text-2xl font-bold text-[#123524] mt-1">
                  {remaining}
                </p>
              </div>
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Total</p>
                <p className="text-2xl font-bold text-[#123524] mt-1">
                  {ticket.quantity}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#3E7B27]">Sales Progress</span>
                <span className="text-[#123524] font-semibold">
                  {soldPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={soldPercentage} className="h-3" />
            </div>
          </div>

          {/* Revenue */}
          <div>
            <h3 className="text-sm font-semibold text-[#123524] mb-2">
              Revenue Generated
            </h3>
            <div className="bg-[#85A947]/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#123524]">
                ₦{revenue.toLocaleString()}
              </div>
              <p className="text-sm text-[#3E7B27] mt-1">
                From {ticket.quantitySold} ticket{ticket.quantitySold !== 1 ? "s" : ""} sold
              </p>
            </div>
          </div>

          {/* Purchase Limits */}
          <div>
            <h3 className="text-sm font-semibold text-[#123524] mb-3">
              Purchase Limits
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Minimum Purchase</p>
                <p className="text-xl font-bold text-[#123524] mt-1">
                  {ticket.minPurchase} ticket{ticket.minPurchase !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Maximum Purchase</p>
                <p className="text-xl font-bold text-[#123524] mt-1">
                  {ticket.maxPurchase} ticket{ticket.maxPurchase !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Sale Period */}
          <div>
            <h3 className="text-sm font-semibold text-[#123524] mb-3">
              Sale Period
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Sale Starts</p>
                <p className="text-sm font-medium text-[#123524] mt-1">
                  {formatDate(ticket.saleStartDate)}
                </p>
              </div>
              <div className="bg-white border border-[#85A947]/20 rounded-lg p-4">
                <p className="text-sm text-[#85A947]">Sale Ends</p>
                <p className="text-sm font-medium text-[#123524] mt-1">
                  {formatDate(ticket.saleEndDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#85A947]/20 shrink-0">
          <Button
            onClick={() => setOpen(false)}
            className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}