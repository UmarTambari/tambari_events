"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { CreateEventFormValues } from "@/lib/types/event.type";

export function TicketsStep() {
  const { control } = useFormContext<CreateEventFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
    rules: { minLength: 1, required: "At least one ticket type is required" },
  });

  const addTicketType = () => {
    append({
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: "",
      quantity: "",
      minPurchase: "1",
      maxPurchase: "10",
      saleStartDate: null,
      saleEndDate: null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#123524] mb-2">
          Ticket Types
        </h2>
        <p className="text-sm text-[#3E7B27]">
          Create different ticket types with varying prices and quantities
        </p>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <Card className="bg-[#EFE3C2]/30 border-2 border-dashed border-[#85A947]/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-[#3E7B27] mb-4">No ticket types added yet</p>
              <Button
                onClick={addTicketType}
                className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Ticket Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {fields.map((field, index) => (
              <Card key={field.id} className="bg-white border-[#85A947]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold text-[#123524]">
                    Ticket Type {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <FormField
                    control={control}
                    name={`ticketTypes.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#123524]">
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Early Bird, VIP, Regular"
                            className="border-[#85A947]/20 focus:border-[#3E7B27]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`ticketTypes.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#123524]">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of this ticket type"
                            rows={2}
                            className="resize-none border-[#85A947]/20 focus:border-[#3E7B27]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control}
                      name={`ticketTypes.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#123524]">
                            Price (₦) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000"
                              min="100"
                              className="border-[#85A947]/20 focus:border-[#3E7B27]"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-[#85A947]">Price in Naira</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`ticketTypes.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#123524]">
                            Quantity <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              min="1"
                              className="border-[#85A947]/20 focus:border-[#3E7B27]"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-[#85A947]">
                            Available tickets
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control}
                      name={`ticketTypes.${index}.minPurchase`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#123524]">
                            Min Purchase
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="border-[#85A947]/20 focus:border-[#3E7B27]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`ticketTypes.${index}.maxPurchase`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#123524]">
                            Max Purchase
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="border-[#85A947]/20 focus:border-[#3E7B27]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              onClick={addTicketType}
              variant="outline"
              className="w-full border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Ticket Type
            </Button>
          </>
        )}
      </div>
    </div>
  );
}