import { OrderDetailClient } from "@/components/orders/order-detail";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

// Mock data - replace with actual API call
async function getOrderDetails(id: string) {
  return {
    id: "1",
    orderNumber: "ORD-20241123-ABC1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+234 801 234 5678",
    eventId: "1",
    eventTitle: "Tech Conference 2024",
    eventSlug: "tech-conference-2024",
    eventDate: new Date("2024-12-15T09:00:00"),
    eventVenue: "Eko Convention Center",
    eventLocation: "Lagos, Nigeria",
    subtotal: 23000,
    serviceFee: 2000,
    totalAmount: 25000,
    status: "paid" as const,
    notes: "Please reserve front row seats if possible",
    createdAt: new Date("2024-11-23T10:30:00"),
    paidAt: new Date("2024-11-23T10:32:00"),
    items: [
      {
        id: "1",
        ticketTypeName: "Regular",
        pricePerTicket: 10000,
        quantity: 2,
        subtotal: 20000,
      },
      {
        id: "2",
        ticketTypeName: "Student",
        pricePerTicket: 3000,
        quantity: 1,
        subtotal: 3000,
      },
    ],
    attendees: [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        ticketTypeName: "Regular",
        ticketCode: "TKT-ABC123XYZ",
        isCheckedIn: false,
        checkedInAt: null,
      },
      {
        id: "2",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        ticketTypeName: "Regular",
        ticketCode: "TKT-DEF456UVW",
        isCheckedIn: true,
        checkedInAt: new Date("2024-12-15T09:15:00"),
      },
      {
        id: "3",
        firstName: "Mike",
        lastName: "Doe",
        email: "mike@example.com",
        ticketTypeName: "Student",
        ticketCode: "TKT-GHI789RST",
        isCheckedIn: false,
        checkedInAt: null,
      },
    ],
    transaction: {
      id: "1",
      reference: "TXN-20241123-123456",
      provider: "paystack",
      amount: 25000,
      status: "success",
      channel: "card",
      cardType: "visa",
      lastFourDigits: "4242",
      bank: "GTBank",
      paidAt: new Date("2024-11-23T10:32:00"),
    },
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const order = await getOrderDetails(params.id);

  return <OrderDetailClient order={order} />;
}
