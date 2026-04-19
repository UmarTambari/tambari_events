import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { attendees } from "@/lib/db/schema";

export async function createAttendee(data: {
  orderId: string;
  orderItemId: string;
  eventId: string;
  ticketTypeId: string;
  ticketCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  qrCodeUrl?: string;
}) {
  const [attendee] = await db.insert(attendees).values(data).returning();
  return attendee;
}

/**
 * Updates the qrCodeUrl (QR data string) for an attendee after creation.
 * Called immediately after createAttendee so we can include the attendeeId
 * in the QR payload.
 */
export async function updateAttendeeQRCode(
  attendeeId: string,
  qrCodeData: string
) {
  const [attendee] = await db
    .update(attendees)
    .set({ qrCodeUrl: qrCodeData, updatedAt: new Date() })
    .where(eq(attendees.id, attendeeId))
    .returning();
  return attendee;
}

export async function getAttendeesByOrder(orderId: string) {
  return await db
    .select()
    .from(attendees)
    .where(eq(attendees.orderId, orderId));
}

export async function getAttendeesByEvent(eventId: string) {
  return await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, eventId))
    .orderBy(desc(attendees.createdAt));
}

export async function getAttendeeByTicketCode(ticketCode: string) {
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.ticketCode, ticketCode));
  return attendee;
}

export async function checkInAttendee(attendeeId: string, checkedInBy: string) {
  const [attendee] = await db
    .update(attendees)
    .set({
      isCheckedIn: true,
      checkedInAt: new Date(),
      checkedInBy,
      updatedAt: new Date(),
    })
    .where(eq(attendees.id, attendeeId))
    .returning();
  return attendee;
}

export async function revokeAttendeeTicket(attendeeId: string, reason: string) {
  const [attendee] = await db
    .update(attendees)
    .set({
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(attendees.id, attendeeId))
    .returning();
  return attendee;
}