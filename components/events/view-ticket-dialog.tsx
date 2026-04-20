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
          className="h-8 w-8 text-dash-muted hover:bg-dash-highlight"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl text-dash-ink">
                {ticket.name}
              </DialogTitle>
              <DialogDescription className="text-dash-muted mt-1">
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
              <h3 className="text-sm font-semibold text-dash-ink mb-2">
                Description
              </h3>
              <p className="text-sm text-dash-muted">{ticket.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-dash-ink mb-2">
              Pricing
            </h3>
            <div className="bg-dash-highlight/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-dash-ink">
                ₦{(ticket.price / 100).toLocaleString()}
              </div>
              <p className="text-sm text-dash-accent mt-1">per ticket</p>
            </div>
          </div>

          {/* Sales Statistics */}
          <div>
            <h3 className="text-sm font-semibold text-dash-ink mb-3">
              Sales Statistics
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Sold</p>
                <p className="text-2xl font-bold text-dash-ink mt-1">
                  {ticket.quantitySold}
                </p>
              </div>
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Remaining</p>
                <p className="text-2xl font-bold text-dash-ink mt-1">
                  {remaining}
                </p>
              </div>
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Total</p>
                <p className="text-2xl font-bold text-dash-ink mt-1">
                  {ticket.quantity}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dash-muted">Sales Progress</span>
                <span className="text-dash-ink font-semibold">
                  {soldPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={soldPercentage} className="h-3" />
            </div>
          </div>

          {/* Revenue */}
          <div>
            <h3 className="text-sm font-semibold text-dash-ink mb-2">
              Revenue Generated
            </h3>
            <div className="bg-dash-accent/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-dash-ink">
                ₦{revenue.toLocaleString()}
              </div>
              <p className="text-sm text-dash-muted mt-1">
                From {ticket.quantitySold} ticket{ticket.quantitySold !== 1 ? "s" : ""} sold
              </p>
            </div>
          </div>

          {/* Purchase Limits */}
          <div>
            <h3 className="text-sm font-semibold text-dash-ink mb-3">
              Purchase Limits
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Minimum Purchase</p>
                <p className="text-xl font-bold text-dash-ink mt-1">
                  {ticket.minPurchase} ticket{ticket.minPurchase !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Maximum Purchase</p>
                <p className="text-xl font-bold text-dash-ink mt-1">
                  {ticket.maxPurchase} ticket{ticket.maxPurchase !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Sale Period */}
          <div>
            <h3 className="text-sm font-semibold text-dash-ink mb-3">
              Sale Period
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Sale Starts</p>
                <p className="text-sm font-medium text-dash-ink mt-1">
                  {formatDate(ticket.saleStartDate)}
                </p>
              </div>
              <div className="bg-white border border-dash-border rounded-lg p-4">
                <p className="text-sm text-dash-accent">Sale Ends</p>
                <p className="text-sm font-medium text-dash-ink mt-1">
                  {formatDate(ticket.saleEndDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-dash-border shrink-0">
          <Button
            onClick={() => setOpen(false)}
            className="bg-dash-accent hover:bg-dash-accent-strong text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}