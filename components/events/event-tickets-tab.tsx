"use client";

import { useEffect, useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TicketType } from "@/lib/types/ticketTypes.types"

import { AddTicketDialog } from "./add-ticket-dialog";
import { EditTicketDialog } from "./edit-ticket-dialog";
import { DeleteTicketDialog } from "./delete-ticket-dialog";
import { ViewTicketDialog } from "./view-ticket-dialog";


interface EventTicketsTabProps {
  eventId: string;
}

export function EventTicketsTab({ eventId }: EventTicketsTabProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchTickets = async () => {
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}/tickets`);
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setTicketTypes(result.success ? result.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch(
          `/api/dashboard/events/${eventId}/tickets`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setTicketTypes(result.data);
        } else {
          setTicketTypes([]);
        }
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch tickets"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchTickets();
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#85A947]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Error loading tickets</p>
        <p className="text-sm text-[#85A947]">{error}</p>
      </div>
    );
  }

  const totalRevenue = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantitySold,
    0
  );
  const totalSold = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.quantitySold,
    0
  );
  const totalQuantity = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Total Ticket Types</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              {ticketTypes.length}
            </p>
            <p className="text-xs text-[#85A947] mt-1">
              {ticketTypes.filter((t) => t.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Tickets Sold</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              {totalSold} / {totalQuantity}
            </p>
            <Progress
              value={totalQuantity > 0 ? (totalSold / totalQuantity) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Total Revenue</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              ₦{(totalRevenue / 100).toLocaleString()}
            </p>
            <p className="text-xs text-[#85A947] mt-1">From ticket sales</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#85A947]/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#123524]">
            Ticket Types
          </CardTitle>
          <AddTicketDialog eventId={eventId} onSuccess={refetchTickets} />
        </CardHeader>
        <CardContent>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#85A947] mb-2">No ticket types created yet</p>
              <p className="text-sm text-[#3E7B27] mb-4">
                Create ticket types to start selling tickets
              </p>
              <AddTicketDialog eventId={eventId} onSuccess={refetchTickets} />
            </div>
          ) : (
            <div className="rounded-md border border-[#85A947]/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#EFE3C2] hover:bg-[#EFE3C2]">
                    <TableHead className="text-[#123524] font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Price
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Sold / Total
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Sale Period
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketTypes.map((ticket) => {
                    const soldPercentage =
                      (ticket.quantitySold / ticket.quantity) * 100;
                    const isAlmostSoldOut = soldPercentage >= 90;
                    const isSoldOut = ticket.quantitySold >= ticket.quantity;

                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#123524]">
                              {ticket.name}
                            </p>
                            {ticket.description && (
                              <p className="text-sm text-[#85A947] line-clamp-1">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#123524]">
                            ₦{(ticket.price / 100).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-[#123524]">
                              {ticket.quantitySold} / {ticket.quantity}
                            </p>
                            <Progress
                              value={soldPercentage}
                              className="h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSoldOut ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              Sold Out
                            </Badge>
                          ) : isAlmostSoldOut ? (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                              Almost Full
                            </Badge>
                          ) : ticket.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[#3E7B27]">
                            {ticket.saleStartDate && ticket.saleEndDate ? (
                              <>
                                <p>
                                  {new Date(
                                    ticket.saleStartDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-[#85A947]">
                                  to{" "}
                                  {new Date(
                                    ticket.saleEndDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </>
                            ) : (
                              <p>No restrictions</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#3E7B27]"
                            >
                              {ticket.isActive ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <ViewTicketDialog ticket={ticket} />
                            <EditTicketDialog
                              ticket={ticket}
                              eventId={eventId}
                              onSuccess={refetchTickets}
                            />
                            <DeleteTicketDialog
                              eventId={eventId}
                              ticket={{
                                id: ticket.id,
                                name: ticket.name,
                                quantitySold: ticket.quantitySold,
                              }}
                              onSuccess={refetchTickets}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
