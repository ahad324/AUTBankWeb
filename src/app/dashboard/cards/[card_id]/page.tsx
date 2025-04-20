"use client";

import { NextPage } from "next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UpdateCardRequest } from "@/types/api";
import { useRouter } from "next/navigation";
import { maskCardNumber } from "@/lib/utils";

const updateCardSchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 digits").optional(),
  status: z.enum(["Active", "Inactive", "Blocked"]).optional(),
});

type UpdateCardFormData = z.infer<typeof updateCardSchema>;

interface CardDetailProps {
  params: { card_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const CardDetail: NextPage<CardDetailProps> = ({ params }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const cardId = params.card_id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCardFormData>({
    resolver: zodResolver(updateCardSchema),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["card", cardId],
    queryFn: () => apiService.getCardById(parseInt(cardId)),
    enabled: !!cardId,
    select: (response) => response,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateCardRequest) =>
      apiService.updateCard(Number(cardId), data),
    onSuccess: () => {
      toast.success("Card updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update card"),
  });

  const onSubmit = (formData: UpdateCardFormData) => {
    mutation.mutate({
      Pin: formData.pin,
      Status: formData.status,
    });
  };

  if (isLoading) return <LoadingSpinner text="Loading Card Details..." />;
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load card
        </p>
        <Button
          onClick={() => router.push("/dashboard/cards")}
          variant="outline"
        >
          Back to Cards
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Card Details</h1>
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>{maskCardNumber(data?.CardNumber || "")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <span className="text-muted-foreground">Card ID: </span>
              <span className="text-foreground">{data?.CardID}</span>
            </div>
            <div>
              <span className="text-muted-foreground">User ID: </span>
              <span className="text-foreground">{data?.UserID}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expiration Date: </span>
              <span className="text-foreground">
                {new Date(data?.ExpirationDate || "").toLocaleDateString()}
              </span>
            </div>
            <div>
              <label className="text-muted-foreground">PIN</label>
              <Input
                type="password"
                {...register("pin")}
                className="bg-input text-foreground"
              />
              {errors.pin && (
                <p className="text-destructive text-sm">{errors.pin.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Status</label>
              <select
                {...register("status")}
                className="bg-input text-foreground border-input rounded-md p-2 w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
              {errors.status && (
                <p className="text-destructive text-sm">
                  {errors.status.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full"
            >
              {isSubmitting || mutation.isPending
                ? "Updating..."
                : "Update Card"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard/cards")}
              variant="outline"
              className="w-full mt-2"
            >
              Back to Cards
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default CardDetail;
