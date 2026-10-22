"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, UserRound } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VerifiedCard } from "@/components/ui/verified-card";
import { useDepartments } from "@/hooks/useDirectory";
import { useMyProfile } from "@/hooks/useMyProfile";
import type { ProfileUpdates } from "@/hooks/useMyProfile";
import { useAuthStore } from "@/store/useAuthStore";

const emptyProfile: ProfileUpdates = {
  name: "",
  matricNumber: "",
  phone: "",
  department: "",
  faculty: "",
  currentLevel: "",
  bio: "",
};

const fieldClassName = "bg-background";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { profileQuery, updateProfile } = useMyProfile(user?.id);
  const { data: departments = [] } = useDepartments();
  const [form, setForm] = useState<ProfileUpdates>(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profileQuery.data) return;
    const profile = profileQuery.data;
    setForm({
      name: profile.name ?? "",
      matricNumber: profile.matricNumber ?? "",
      phone: profile.phone ?? "",
      department: profile.department ?? "",
      faculty: profile.faculty ?? "",
      currentLevel: profile.currentLevel ?? "",
      bio: profile.bio ?? "",
    });
    if (token) setAuth(token, profile);
  }, [profileQuery.data, setAuth, token]);

  const updateField = (field: keyof ProfileUpdates, value: string) => {
    setSaved(false);
    updateProfile.reset();
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    updateProfile.mutate(form, {
      onSuccess: () => setSaved(true),
    });
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <VerifiedCard className="border-border p-8">
            <UserRound className="mx-auto h-9 w-9 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Sign in to manage your profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your contact and academic details to your student profile.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth">Sign In</Link>
            </Button>
          </VerifiedCard>
        </main>
      </>
    );
  }

  const apiError = updateProfile.error;
  const errorMessage = axios.isAxiosError(apiError)
    ? apiError.response?.data?.error || "Could not save your profile. Please try again."
    : apiError?.message;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>

          <header>
            <p className="text-sm text-muted-foreground">Student account</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">Your profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your academic and contact details. You can update these any time.
            </p>
          </header>

          {profileQuery.isError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load your profile. Refresh the page and try again.
            </div>
          )}

          <VerifiedCard className="border-border p-5 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-7">
              <section className="space-y-4">
                <div>
                  <h2 className="font-semibold text-foreground">Personal details</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Your name is shown with your activity.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full name</Label>
                    <Input
                      id="profile-name"
                      className={fieldClassName}
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Student email</Label>
                    <Input id="profile-email" className={fieldClassName} value={profileQuery.data?.email ?? user.email ?? ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-matric">Matric number</Label>
                    <Input
                      id="profile-matric"
                      className={fieldClassName}
                      placeholder="e.g. 190101001"
                      value={form.matricNumber}
                      onChange={(event) => updateField("matricNumber", event.target.value)}
                      minLength={form.matricNumber ? 5 : undefined}
                      maxLength={30}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone number</Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      className={fieldClassName}
                      placeholder="e.g. +234 800 000 0000"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      maxLength={25}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border pt-6">
                <div>
                  <h2 className="font-semibold text-foreground">Academic details</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Help other students find resources for your programme.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-department">Department</Label>
                    <Input
                      id="profile-department"
                      className={fieldClassName}
                      list="profile-departments"
                      placeholder="Select or enter a department"
                      value={form.department}
                      onChange={(event) => updateField("department", event.target.value)}
                      maxLength={120}
                    />
                    <datalist id="profile-departments">
                      {departments.map((department) => <option key={department._id} value={department.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-faculty">Faculty</Label>
                    <Input
                      id="profile-faculty"
                      className={fieldClassName}
                      placeholder="Your faculty or college"
                      value={form.faculty}
                      onChange={(event) => updateField("faculty", event.target.value)}
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-level">Current level</Label>
                    <select
                      id="profile-level"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={form.currentLevel}
                      onChange={(event) => updateField("currentLevel", event.target.value)}
                    >
                      <option value="">Select your current level</option>
                      {["100", "200", "300", "400", "500", "600"].map((level) => (
                        <option key={level} value={level}>{level} Level</option>
                      ))}
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-2 border-t border-border pt-6">
                <Label htmlFor="profile-bio">About you <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <textarea
                  id="profile-bio"
                  className="min-h-28 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Share a little about yourself or the resources you contribute."
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  maxLength={500}
                />
                <p className="text-right text-xs text-muted-foreground">{form.bio.length}/500</p>
              </section>

              {(errorMessage || saved) && (
                <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${errorMessage ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`} role="status">
                  {errorMessage ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {errorMessage || "Your profile has been saved."}
                </div>
              )}

              <div className="flex justify-end border-t border-border pt-5">
                <Button type="submit" disabled={updateProfile.isPending || profileQuery.isLoading || profileQuery.isError}>
                  {updateProfile.isPending ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </VerifiedCard>
        </div>
      </main>
    </>
  );
}
