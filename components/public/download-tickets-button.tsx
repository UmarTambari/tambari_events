"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadTicketsButtonProps {
  orderNumber: string;
}

export function DownloadTicketsButton({ orderNumber }: DownloadTicketsButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // In a real implementation, this would call an API endpoint that generates
      // a PDF with all tickets using a library like PDFKit or Puppeteer
      toast.promise(
        fetch(`/api/tickets/download?orderNumber=${orderNumber}`),
        {
          loading: "Generating PDF...",
          success: "Tickets downloaded!",
          error: "Failed to download tickets",
        }
      );
      
      // For now, we'll just show a success message
      // The actual PDF generation would be implemented in /api/tickets/download
      setTimeout(() => {
        toast.info("PDF generation coming soon!");
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Download Tickets</span>
        </>
      )}
    </button>
  );
}