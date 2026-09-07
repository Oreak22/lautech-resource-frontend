import { Navbar } from '@/components/layouts/Navbar';
import { VerifiedCard } from '@/components/ui/verified-card';
import { Scale, UserCheck, ShieldAlert, FileWarning, EyeOff } from 'lucide-react';

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-mono tracking-tight flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              Rules & Conduct
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base max-w-2xl">
              To ensure LRB Vault remains a reliable, safe, and academically rigorous platform for all students, we enforce the following guidelines strictly.
            </p>
          </div>

          <div className="grid gap-6">
            
            {/* Academic Integrity */}
            <VerifiedCard className="p-6 md:p-8 border-border flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FileWarning className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">1. Academic Integrity & Copyright</h2>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4 marker:text-primary">
                  <li>Only upload materials you have the right to share (e.g., personal notes, public past questions, official handouts explicitly shared for student use).</li>
                  <li>Do not upload active exam papers, premium textbooks, or plagiarized assignments.</li>
                  <li>AI-generated summaries must not be manipulated to bypass moderation.</li>
                </ul>
              </div>
            </VerifiedCard>

            {/* Lecturer Reviews */}
            <VerifiedCard className="p-6 md:p-8 border-border flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">2. Lecturer Reviews & Feedback</h2>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4 marker:text-secondary">
                  <li>Reviews must be constructive, focusing on teaching methodology, course material clarity, and grading fairness.</li>
                  <li>Personal attacks, hate speech, body shaming, or defamatory comments will result in immediate account suspension.</li>
                  <li>Keep feedback objective. Disagreeing with a strict grading policy is allowed; insulting the lecturer is not.</li>
                </ul>
              </div>
            </VerifiedCard>

            {/* Anonymity */}
            <VerifiedCard className="p-6 md:p-8 border-border flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <EyeOff className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">3. Anonymity Protections</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  When you check "Post Anonymously" on a review, your identity is cryptographically unlinked from the public frontend. However:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4 marker:text-primary">
                  <li>Admins retain the ability to trace severe violations (e.g., threats, extreme harassment) to the source account.</li>
                  <li>Do not use anonymity as a shield for malicious behavior.</li>
                </ul>
              </div>
            </VerifiedCard>

            {/* Enforcement */}
            <VerifiedCard className="p-6 md:p-8 border-destructive/30 bg-destructive/5 flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center justify-center text-destructive">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Enforcement & Strikes</h2>
                <p className="text-sm text-muted-foreground">
                  Our admin team monitors the platform heavily. Violations result in rejected uploads. Repeated violations (3 strikes) will result in a permanent ban of your <span className="font-mono text-xs">@student.lautech.edu.ng</span> email address from the platform.
                </p>
              </div>
            </VerifiedCard>

          </div>
        </div>
      </main>
    </>
  );
}