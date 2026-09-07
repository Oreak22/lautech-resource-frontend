import Link from 'next/link';
import { Navbar } from '@/components/layouts/Navbar';
import { VerifiedCard } from '@/components/ui/verified-card';
import { Button } from '@/components/ui/button';
import { 
  Search, UploadCloud, Cpu, ShieldCheck, 
  MessageSquare, ArrowRight, BookOpen 
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "1. Discover Resources",
      description: "Search the Vault for course materials, past questions, and lecture notes. Filter by department, course code, or specific lecturers."
    },
    {
      icon: <Cpu className="h-6 w-6 text-secondary" />,
      title: "2. AI-Powered Ingestion",
      description: "When you upload a document, our Google Gemini 2.0 AI automatically scans it, extracts the title, summarizes the content, and generates search keywords."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "3. Admin Moderation",
      description: "To maintain academic integrity, every uploaded file goes into a Moderation Queue. Verified admins review the AI's confidence score and approve the file."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-secondary" />,
      title: "4. Review & Feedback",
      description: "Visit Lecturer Profiles to leave anonymous, constructive reviews on teaching styles. Upvote helpful reviews and build a reliable academic directory."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-mono tracking-tight">
              How LRB Vault Works
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              A transparent, AI-assisted pipeline designed to democratize academic resources for LAUTECH students while maintaining strict quality control.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {steps.map((step, index) => (
              <VerifiedCard key={index} className="p-8 border-border hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-card border border-border flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </VerifiedCard>
            ))}
          </div>

          {/* Call to Action */}
          <VerifiedCard className="p-8 border-border bg-card/50 text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to contribute?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Help build the largest student-driven academic repository. Upload your first document today.
            </p>
            <div className="flex gap-4">
              <Button asChild className="gap-2">
                <Link href="/upload">
                  <UploadCloud className="h-4 w-4" /> Go to Upload
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard">
                  Explore Vault <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </VerifiedCard>

        </div>
      </main>
    </>
  );
}