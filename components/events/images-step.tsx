// app/dashboard/events/create/images-step.tsx
"use client";

import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";

import type { CreateEventFormValues } from "@/lib/types/event.type";

export function ImagesStep() {
  const { control, watch, setValue } = useFormContext<CreateEventFormValues>();

  const bannerImageUrl = watch("bannerImageUrl");
  const thumbnailImageUrl = watch("thumbnailImageUrl");

  const clearBanner = () =>
    setValue("bannerImageUrl", "", { shouldValidate: true });
  const clearThumbnail = () =>
    setValue("thumbnailImageUrl", "", { shouldValidate: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#123524] mb-2">Event Images</h2>
        <p className="text-sm text-[#3E7B27]">
          Add image URLs to make your event more appealing
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={control}
            name="bannerImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#123524]">
                  Banner Image URL
                  <span className="text-xs text-[#85A947] ml-2 font-normal">
                    (Recommended: 1920×1080px)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/banner.jpg"
                    className="border-[#85A947]/20 focus:border-[#3E7B27]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {bannerImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-[#85A947]/20 shadow-sm">
              <Image
                src={bannerImageUrl}
                alt="Banner preview"
                width={1200}
                height={600}
                className="w-full object-cover"
                unoptimized
                onError={() => clearBanner()} // Auto-clear if broken URL
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={clearBanner}
                className="absolute top-3 right-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <p className="text-xs text-[#85A947]">
            This image will be displayed at the top of your event page
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={control}
            name="thumbnailImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#123524]">
                  Thumbnail Image URL
                  <span className="text-xs text-[#85A947] ml-2 font-normal">
                    (Recommended: 800×600px)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/thumbnail.jpg"
                    className="border-[#85A947]/20 focus:border-[#3E7B27]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {thumbnailImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-[#85A947]/20 shadow-sm max-w-md">
              <Image
                src={thumbnailImageUrl}
                alt="Thumbnail preview"
                width={800}
                height={600}
                className="w-full object-cover"
                unoptimized
                onError={() => clearThumbnail()}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={clearThumbnail}
                className="absolute top-3 right-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <p className="text-xs text-[#85A947]">
            This image will be shown in event listings and cards
          </p>
        </div>

        {/* Tip Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can skip this step and add images later.
              Events without images will display a default placeholder.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
