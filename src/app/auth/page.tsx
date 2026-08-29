"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedCard } from "@/components/ui/verified-card";
import { GraduationCap, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { axiosClient } from "@/lib/api/axiosClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type FormValues = LoginFormValues | RegisterFormValues;

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (val) =>
        val.endsWith("lautech.edu.ng") ||
        val.endsWith("student.lautech.edu.ng"),
      { message: "Must use a valid LAUTECH student email" },
    ),
  matricNumber: z.string().min(5, "Matriculation number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Code of Conduct" }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });
  const handleTabSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setErrorMsg("");
    setSuccessMsg("");
    reset(); // Clears previous form errors and values cleanly
  };
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        const loginData = data as LoginFormValues;
        const res = await axiosClient.post("/auth/login", {
          email: loginData.email,
          password: loginData.password,
        });
        setAuth(res.data.token, res.data.user);
        router.push("/dashboard");
      } else {
        const regData = data as RegisterFormValues;
        const res = await axiosClient.post("/auth/register", {
          name: regData.name,
          email: regData.email,
          password: regData.password,
          matricNumber: regData.matricNumber,
        });
        setSuccessMsg(
          res.data.message || "Verification email sent! Check your inbox.",
        );
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(
        error.response?.data?.error || "Authentication action failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/auth/google", {
        token: credentialResponse.credential,
      });
      setAuth(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(
        error.response?.data?.error || "Google authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8">
        {/* Header branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to LRB Vault
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Access the verified academic repository.
          </p>
        </div>

        <VerifiedCard className="p-8 border border-border bg-card shadow-lg">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-background rounded-lg mb-6 border border-border">
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-md bg-primary/10 border border-primary/25 text-primary text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Full Name
                </label>
                <Input placeholder="e.g. Obe Rejoice" {...register("name")} />

                {(errors as Record<string, { message?: string }>).name && (
                  <p className="text-xs text-destructive mt-1">
                    {String(
                      (errors as Record<string, { message?: string }>).name
                        ?.message,
                    )}
                  </p>
                )}
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
              {!isLogin && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  Must use valid student email
                </p>
              )}
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            {/* {!isLogin && (
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Matriculation Number
                </label>
                <Input
                  placeholder="e.g. 180922"
                  {...register("matricNumber")}
                />
                {errors.matricNumber && (
                  <p className="text-xs text-destructive mt-1">
                    {String(errors.matricNumber.message)}
                  </p>
                )}
              </div>
              
            )} */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Matriculation Number
                </label>
                <Input
                  placeholder="e.g. 180922"
                  {...register("matricNumber")}
                />
                {(errors as Record<string, { message?: string }>)
                  .matricNumber && (
                  <p className="text-xs text-destructive mt-1">
                    {String(
                      (errors as Record<string, { message?: string }>)
                        .matricNumber?.message,
                    )}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                Password
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
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {!isLogin && (
              <>
                <div className="p-3 rounded-md bg-background/60 border border-border flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your identity remains{" "}
                    <span className="text-foreground font-semibold">
                      100% anonymous
                    </span>{" "}
                    on uploaded materials and reviews unless you choose to make
                    your name public.
                  </p>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register("agreeToTerms")}
                    className="mt-1 rounded border-border bg-input"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-muted-foreground leading-snug"
                  >
                    I agree to the LRB Academic Code of Conduct (No exam leaks,
                    no toxic harassment).
                  </label>
                </div>
                {/* {errors.agreeToTerms && (
                  <p className="text-xs text-destructive">
                    {String(errors.agreeToTerms.message)}
                  </p>
                )} */}

                {(errors as Record<string, { message?: string }>)
                  .agreeToTerms && (
                  <p className="text-xs text-destructive mt-1">
                    {String(
                      (errors as Record<string, { message?: string }>)
                        .agreeToTerms?.message,
                    )}
                  </p>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full gap-2 mt-2"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isLogin
                  ? "Sign In to Vault"
                  : "Create Student Account →"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg("Google Sign-In failed")}
              theme="filled_black"
              shape="rectangular"
              width="100%"
            />
          </div>
        </VerifiedCard>
      </div>
    </div>
  );
}
