"use client";

import { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventOverviewTab } from "./event-overview-tab";
import { EventTicketsTab } from "./event-tickets-tab";
import { EventOrdersTab } from "./event-orders-tab";
import { EventAnalyticsTab } from "./event-analytics-tab";

interface EventTabsWrapperProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    eventDate: Date | string;
    eventEndDate?: Date | string | null;
    location: string;
    venue: string;
    totalCapacity: number | null;
    category?: string | null;
    tags?: string[] | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

export function EventTabsWrapper({ event }: EventTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-white border border-dash-border">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="tickets"
          className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
        >
          Tickets
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
        >
          Orders
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
        >
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EventOverviewTab event={event} />
      </TabsContent>

      <TabsContent value="tickets">
        <Suspense fallback={<TabLoadingState />}>
          <EventTicketsTab eventId={event.id} />
        </Suspense>
      </TabsContent>

      <TabsContent value="orders">
        <Suspense fallback={<TabLoadingState />}>
          <EventOrdersTab eventId={event.id} />
        </Suspense>
      </TabsContent>

      <TabsContent value="analytics">
        <Suspense fallback={<TabLoadingState />}>
          <EventAnalyticsTab eventId={event.id} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

function TabLoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dash-accent"></div>
    </div>
  );
}
