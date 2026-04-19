import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { getUserByAuthId }            from "@/lib/queries/users.queries";
import { getOrderByNumber, getOrderWithDetails } from "@/lib/queries/order.queries";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByAuthId(supabaseUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 }
      );
    }

    const orderBasic = await getOrderByNumber(orderNumber);
    if (!orderBasic) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ownership check
    if (orderBasic.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only paid orders can have tickets downloaded
    if (orderBasic.status !== "paid") {
      return NextResponse.json(
        { error: "Tickets are only available for paid orders" },
        { status: 400 }
      );
    }

    const order = await getOrderWithDetails(orderBasic.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.attendees || order.attendees.length === 0) {
      return NextResponse.json(
        { error: "No tickets found for this order" },
        { status: 404 }
      );
    }

    // ─── Build the PDF ────────────────────────────────────────────────────────

    const pdfDoc = await PDFDocument.create();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colours
    const darkGreen = rgb(0.071, 0.208, 0.141);   // #123524
    const medGreen = rgb(0.243, 0.482, 0.153);    // #3E7B27
    const lightGreen = rgb(0.522, 0.663, 0.278);  // #85A947
    const cream = rgb(0.937, 0.890, 0.761);        // #EFE3C2
    const white = rgb(1, 1, 1);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.9, 0.9, 0.9);

    const PAGE_WIDTH = 595;   // A4 width in points
    const PAGE_HEIGHT = 842;  // A4 height in points
    const MARGIN = 40;
    const TICKET_HEIGHT = 200;
    const TICKET_GAP = 20;
    const QR_SIZE = 130;

    for (let i = 0; i < order.attendees.length; i++) {
      const attendee = order.attendees[i];

      // Each ticket gets its own page for easy printing/saving
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

      // ── Header bar ──────────────────────────────────────────────────────────
      page.drawRectangle({
        x: 0,
        y: PAGE_HEIGHT - 80,
        width: PAGE_WIDTH,
        height: 80,
        color: darkGreen,
      });

      page.drawText("EventHub", {
        x: MARGIN,
        y: PAGE_HEIGHT - 48,
        size: 28,
        font: boldFont,
        color: cream,
      });

      page.drawText("YOUR TICKET", {
        x: PAGE_WIDTH - MARGIN - 100,
        y: PAGE_HEIGHT - 48,
        size: 14,
        font: boldFont,
        color: lightGreen,
      });

      // ── Event name ──────────────────────────────────────────────────────────
      const eventTitle = order.event?.title ?? "Event";
      page.drawText(eventTitle, {
        x: MARGIN,
        y: PAGE_HEIGHT - 120,
        size: 20,
        font: boldFont,
        color: darkGreen,
        maxWidth: PAGE_WIDTH - MARGIN * 2,
      });

      // ── Event date & venue ──────────────────────────────────────────────────
      const eventDate = order.event?.eventDate
        ? new Date(order.event.eventDate).toLocaleString("en-NG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      page.drawText(eventDate, {
        x: MARGIN,
        y: PAGE_HEIGHT - 148,
        size: 11,
        font: regularFont,
        color: medGreen,
      });

      if (order.event?.venue) {
        page.drawText(`${order.event.venue}, ${order.event.location}`, {
          x: MARGIN,
          y: PAGE_HEIGHT - 166,
          size: 11,
          font: regularFont,
          color: medGreen,
        });
      }

      // ── Divider ─────────────────────────────────────────────────────────────
      page.drawLine({
        start: { x: MARGIN, y: PAGE_HEIGHT - 185 },
        end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 185 },
        thickness: 1,
        color: lightGray,
      });

      // ── Ticket card area ────────────────────────────────────────────────────
      const cardY = PAGE_HEIGHT - 410;
      const cardHeight = 200;

      page.drawRectangle({
        x: MARGIN,
        y: cardY,
        width: PAGE_WIDTH - MARGIN * 2,
        height: cardHeight,
        color: cream,
        borderColor: lightGreen,
        borderWidth: 1.5,
      });

      // Left section: attendee & ticket details
      const detailsX = MARGIN + 16;
      const detailsStartY = cardY + cardHeight - 30;

      page.drawText(`Ticket ${i + 1} of ${order.attendees.length}`, {
        x: detailsX,
        y: detailsStartY,
        size: 9,
        font: regularFont,
        color: lightGreen,
      });

      page.drawText(
        `${attendee.firstName} ${attendee.lastName}`,
        {
          x: detailsX,
          y: detailsStartY - 22,
          size: 16,
          font: boldFont,
          color: darkGreen,
        }
      );

      page.drawText(attendee.email, {
        x: detailsX,
        y: detailsStartY - 42,
        size: 10,
        font: regularFont,
        color: darkGray,
      });

      // Ticket type
      page.drawText("TICKET TYPE", {
        x: detailsX,
        y: detailsStartY - 68,
        size: 8,
        font: boldFont,
        color: lightGreen,
      });
      page.drawText(attendee.ticketTypeName ?? "", {
        x: detailsX,
        y: detailsStartY - 82,
        size: 12,
        font: boldFont,
        color: darkGreen,
      });

      // Order number
      page.drawText("ORDER NUMBER", {
        x: detailsX,
        y: detailsStartY - 108,
        size: 8,
        font: boldFont,
        color: lightGreen,
      });
      page.drawText(order.orderNumber, {
        x: detailsX,
        y: detailsStartY - 122,
        size: 11,
        font: regularFont,
        color: darkGray,
      });

      // Ticket code
      page.drawText("TICKET CODE", {
        x: detailsX,
        y: detailsStartY - 148,
        size: 8,
        font: boldFont,
        color: lightGreen,
      });
      page.drawText(attendee.ticketCode, {
        x: detailsX,
        y: detailsStartY - 162,
        size: 13,
        font: boldFont,
        color: darkGreen,
      });

      // ── Vertical dotted separator ────────────────────────────────────────────
      const separatorX = PAGE_WIDTH - MARGIN - QR_SIZE - 30;
      for (let dotY = cardY + 10; dotY < cardY + cardHeight - 10; dotY += 8) {
        page.drawCircle({
          x: separatorX,
          y: dotY,
          size: 1,
          color: lightGreen,
        });
      }

      // ── QR Code ──────────────────────────────────────────────────────────────
      if (attendee.qrCodeUrl) {
        try {
          // Generate a PNG buffer server-side from the stored QR data string
          const qrPngBuffer = await QRCode.toBuffer(attendee.qrCodeUrl, {
            type: "png",
            width: QR_SIZE * 2, // 2x for retina clarity in PDF
            margin: 1,
            color: {
              dark: "#123524",
              light: "#FFFFFF",
            },
          });

          const qrImage = await pdfDoc.embedPng(qrPngBuffer);

          const qrX = PAGE_WIDTH - MARGIN - QR_SIZE - 6;
          const qrY = cardY + (cardHeight - QR_SIZE) / 2;

          // White background behind QR
          page.drawRectangle({
            x: qrX - 4,
            y: qrY - 4,
            width: QR_SIZE + 8,
            height: QR_SIZE + 8,
            color: white,
          });

          page.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: QR_SIZE,
            height: QR_SIZE,
          });

          page.drawText("Scan to check in", {
            x: qrX + 4,
            y: qrY - 16,
            size: 8,
            font: regularFont,
            color: medGreen,
          });
        } catch (qrError) {
          console.error("QR generation error for attendee:", attendee.id, qrError);
          // Continue without QR if generation fails — ticket still valid
        }
      }

      // ── Footer ───────────────────────────────────────────────────────────────
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: 50,
        color: darkGreen,
      });

      page.drawText(
        "This ticket is your proof of purchase. Please present at the event entrance.",
        {
          x: MARGIN,
          y: 20,
          size: 8,
          font: regularFont,
          color: cream,
          maxWidth: PAGE_WIDTH - MARGIN * 2,
        }
      );
    }

    // ── Serialize and return the PDF ──────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tickets-${orderNumber}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Ticket download error:", error);
    return NextResponse.json(
      { error: "Failed to generate tickets PDF" },
      { status: 500 }
    );
  }
}