"use client";

import { useState } from "react";
import { Share2, Facebook, Twitter, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/lib/types/event.type";

interface ShareButtonProps {
  event: Event;
}

export function ShareButton({ event }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

 const eventUrl = typeof window !== "undefined"
  ? `${window.location.origin}/events/${event.slug}`
  : `/events/${event.slug}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(event.title)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.substring(0, 100),
          url: eventUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Share2 className="h-5 w-5" />
        <span className="font-medium">Share Event</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 space-y-2">
              <button
                onClick={() => {
                  window.open(shareLinks.facebook, "_blank", "width=600,height=400");
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Share on Facebook</span>
              </button>

              <button
                onClick={() => {
                  window.open(shareLinks.twitter, "_blank", "width=600,height=400");
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                <span className="text-sm font-medium">Share on Twitter</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <LinkIcon className="h-5 w-5 text-gray-600" />
                )}
                <span className="text-sm font-medium">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}