"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { axiosClient } from "@/lib/api/axiosClient";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedCard } from "@/components/ui/verified-card";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit: SubmitHandler<ResetFormValues> = async (data) => {
    setStatus("loading");
    try {
      await axiosClient.put(`/auth/resetpassword/${params.token}`, {
        password: data.password,
      });
      router.push("/auth?reset=success");
    } catch (err: unknown) {
      setStatus("error");
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMessage(
        error.response?.data?.error || "Invalid or expired reset token.",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure your LRB Vault access.
          </p>
        </div>

        <VerifiedCard className="p-8 border border-border shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {status === "error" && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                Confirm Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Securing Account..." : "Update Password"}
            </Button>
          </form>
        </VerifiedCard>
      </div>
    </div>
  );
}
