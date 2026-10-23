"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  AtSign,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

interface ShareMenuProps {
  path: string;
  title: string;
  description?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
}

export function ShareMenu({
  path,
  title,
  description,
  variant = "outline",
  size = "icon",
  className = "",
  label,
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareType = path.startsWith("/lecturers/")
    ? "lecturer"
    : path.startsWith("/lists/")
      ? "list"
      : "resource";

  const getShareUrl = () => new URL(path, window.location.origin).toString();
  const getShareText = () =>
    [title, description, getShareUrl()].filter(Boolean).join("\n\n");

  const copyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const success = document.execCommand("copy");
      input.remove();
      if (!success) {
        toast.add({ title: "Could not copy link", type: "error" });
        return;
      }
    }

    setCopied(true);
    toast.add({ title: "Link copied", description: "Ready to share.", type: "success" });
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareExternally = (platform: "whatsapp" | "facebook" | "x" | "telegram" | "email") => {
    const url = getShareUrl();
    const text = getShareText();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent([title, description].filter(Boolean).join("\n\n"));
    const destinations = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
    };

    window.open(destinations[platform], "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const shareNative = async () => {
    if (!navigator.share) {
      shareExternally("email");
      return;
    }
    try {
      await navigator.share({ title, text: description, url: getShareUrl() });
      setOpen(false);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.add({ title: "Unable to share", type: "error" });
      }
    }
  };

  const options = [
    { label: "WhatsApp", icon: MessageCircle, action: () => shareExternally("whatsapp"), color: "text-green-600" },
    { label: "Facebook", icon: Globe2, action: () => shareExternally("facebook"), color: "text-blue-600" },
    { label: "X", icon: AtSign, action: () => shareExternally("x"), color: "text-foreground" },
    { label: "Telegram", icon: Send, action: () => shareExternally("telegram"), color: "text-sky-600" },
    { label: "Email", icon: Mail, action: () => shareExternally("email"), color: "text-muted-foreground" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        aria-label={label || `Share ${title}`}
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-4 w-4" />
        {label && <span>{label}</span>}
      </Button>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>Share this {shareType}</DialogTitle>
          <DialogDescription>
            Send this link to classmates or save it for later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {options.map(({ label: optionLabel, icon: Icon, action, color }) => (
            <Button
              key={optionLabel}
              type="button"
              variant="outline"
              className="h-12 justify-start gap-3 border-border"
              onClick={action}
            >
              <Icon className={`h-4 w-4 ${color}`} />
              {optionLabel}
            </Button>
          ))}
          <Button type="button" variant="outline" className="h-12 justify-start gap-3 border-border" onClick={shareNative}>
            <Share2 className="h-4 w-4 text-primary" />
            More options
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <Link2 className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {path}
          </span>
          <Button type="button" size="sm" variant="secondary" className="shrink-0 gap-1.5" onClick={copyLink}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
