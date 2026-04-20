"use client";

import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type { CreateEventFormValues } from "@/lib/types/event.type";

const categories = [
  "Technology",
  "Music",
  "Arts",
  "Sports",
  "Food & Drink",
  "Business",
  "Health & Wellness",
  "Education",
  "Fashion",
  "Film & Media",
  "Other",
] as const;

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function BasicInfoStep() {
  const { control, watch, setValue } = useFormContext<CreateEventFormValues>();
  const [tagInput, setTagInput] = useState("");

  const title = watch("title");
  const tags = watch("tags") || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setValue("tags", [...tags, newTag], { shouldValidate: true });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dash-ink mb-2">
          Basic Information
        </h2>
        <p className="text-sm text-dash-muted">
          Let&apos;s start with the essential details about your event
        </p>
      </div>

      <div className="space-y-6">
        {/* Event Title */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">
                Event Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your event title"
                  className="border-dash-border focus:border-dash-accent-strong"
                  {...field}
                />
              </FormControl>
              {title && (
                <p className="text-xs text-dash-accent">
                  Slug: <span className="font-medium">{generateSlug(title)}</span>
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">
                Description <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your event in detail..."
                  rows={6}
                  className="resize-none border-dash-border focus:border-dash-accent-strong"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-dash-accent">
                {field.value?.length || 0} characters
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">
                Category <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="border-dash-border focus:border-dash-accent-strong">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormItem>
          <FormLabel className="text-dash-ink">Tags</FormLabel>
          <FormControl>
            <Input
              placeholder="Type and press Enter to add tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="border-dash-border focus:border-dash-accent-strong"
            />
          </FormControl>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-dash-highlight border-dash-accent/30 text-dash-ink pl-3 pr-1 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 rounded-full hover:bg-dash-accent/20 p-0.5 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-dash-accent mt-2">
            Add tags to help people find your event
          </p>
        </FormItem>
      </div>
    </div>
  );
}