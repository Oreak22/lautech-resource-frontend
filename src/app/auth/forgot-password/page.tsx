"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { axiosClient } from "@/lib/api/axiosClient";
import Link from "next/link";
import { GraduationCap, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedCard } from "@/components/ui/verified-card";

const forgotSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (val) =>
        val.endsWith("lautech.edu.ng") ||
        val.endsWith("student.lautech.edu.ng"),
      { message: "Must use your registered LAUTECH student email" },
    ),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit: SubmitHandler<ForgotFormValues> = async (data) => {
    setStatus("loading");
    try {
      await axiosClient.post("/auth/forgotpassword", { email: data.email });
      setStatus("success");
      setMessage(
        "If an account exists, a recovery link has been sent to your email.",
      );
    } catch (err: unknown) {
      setStatus("error");
      const error = err as { response?: { data?: { error?: string } } };
      setMessage(error.response?.data?.error || "Failed to process request.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Account Recovery
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your student email to reset your vault access.
          </p>
        </div>

        <VerifiedCard className="p-8 border border-border shadow-lg">
          {status === "success" ? (
            <div className="text-center space-y-4 py-4">
              <MailCheck className="h-12 w-12 text-primary mx-auto" />
              <p className="text-sm text-foreground">{message}</p>
              <Link href="/auth">
                <Button variant="outline" className="w-full mt-4">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {status === "error" && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {message}
                </div>
              )}
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Student Email
                </label>
                <Input
                  placeholder="e.g. username@student.lautech.edu.ng"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Verifying..." : "Send Recovery Link"}
              </Button>
            </form>
          )}
        </VerifiedCard>

        <div className="text-center">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
