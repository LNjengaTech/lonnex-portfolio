"use client";

import * as React from "react";
import { Check, FileText, Loader2, Save, Upload } from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { MediaPicker, type MediaAsset } from "@/components/admin/media-picker";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { updateSiteSettingsAction } from "./actions";
import type { SiteSettingsInput } from "@/lib/validators/settings";

interface SettingsClientFormProps {
  initialSettings: SiteSettingsInput;
  mediaAssets: MediaAsset[];
}

export function SettingsClientForm({
  initialSettings,
  mediaAssets,
}: SettingsClientFormProps) {
  const [formData, setFormData] = React.useState<SiteSettingsInput>(initialSettings);
  const [isPending, startTransition] = React.useTransition();
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveStatus(null);

    startTransition(async () => {
      const res = await updateSiteSettingsAction(formData);
      if (res.success) {
        setSaveStatus("Settings saved successfully.");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setErrorMessage(res.error || "Failed to save settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Notifications */}
      {saveStatus && (
        <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 text-success text-xs font-mono uppercase">
          <Check className="h-4 w-4" />
          <span>{saveStatus}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs font-mono uppercase">
          {errorMessage}
        </div>
      )}

      {/* 1. General Site Identity */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-base text-foreground">
            Site Identity & Hero
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            Global header, brand title, and landing intro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Site Title
            </label>
            <Input
              value={formData.siteTitle}
              onChange={(e) =>
                setFormData({ ...formData, siteTitle: e.target.value })
              }
              placeholder="Lonnex Njenga"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Tagline
            </label>
            <Input
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              placeholder="The Hive"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Hero Text (Homepage Vision)
          </label>
          <Textarea
            value={formData.heroText}
            onChange={(e) =>
              setFormData({ ...formData, heroText: e.target.value })
            }
            rows={3}
            placeholder="Full-stack cross-platform developer and commercial graphic designer architecting bold digital systems."
            required
          />
        </div>
      </div>

      {/* 2. Navigation Labels */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-base text-foreground">
            Navigation Labels
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            Labels shown in the radial menu and navigation chrome
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Work / Projects
            </label>
            <Input
              value={formData.navLabels.work}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, work: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Studio / Graphics
            </label>
            <Input
              value={formData.navLabels.studio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, studio: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Journal / Articles
            </label>
            <Input
              value={formData.navLabels.journal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, journal: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              About
            </label>
            <Input
              value={formData.navLabels.about}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, about: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Now
            </label>
            <Input
              value={formData.navLabels.now}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, now: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Contact
            </label>
            <Input
              value={formData.navLabels.contact}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  navLabels: { ...formData.navLabels, contact: e.target.value },
                })
              }
              required
            />
          </div>
        </div>
      </div>

      {/* 3. SEO Defaults */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-base text-foreground">
            SEO Defaults
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            Default metadata tags for search engines and social crawlers
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Default Meta Title
            </label>
            <Input
              value={formData.seoDefaults.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seoDefaults: {
                    ...formData.seoDefaults,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Lonnex Njenga — Web Developer & Graphic Designer"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Default Meta Description
            </label>
            <Textarea
              value={formData.seoDefaults.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seoDefaults: {
                    ...formData.seoDefaults,
                    description: e.target.value,
                  },
                })
              }
              rows={2}
              placeholder="Portfolio and studio of Lonnex Njenga: Full-stack applications and commercial graphics."
              required
            />
          </div>
        </div>
      </div>

      {/* 4. Theme & Appearance Options */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-base text-foreground">
            Theme & Appearance
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            Default theme preference and visitor toggle permissions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Default Theme
            </label>
            <Select
              value={formData.themeOptions.defaultTheme}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  themeOptions: {
                    ...formData.themeOptions,
                    defaultTheme: e.target.value as "system" | "light" | "dark",
                  },
                })
              }
            >
              <option value="system">System Preference (Auto)</option>
              <option value="dark">Dark Theme (Navy & Electric Blue)</option>
              <option value="light">Light Theme (Clean White & Slate)</option>
            </Select>
          </div>

          <div className="flex items-center justify-between border border-border p-3.5 bg-background">
            <div className="space-y-0.5">
              <span className="text-xs font-mono uppercase text-foreground font-bold">
                Visitor Theme Toggle
              </span>
              <p className="text-[10px] text-muted-foreground font-mono">
                Allow visitors to switch theme via the header
              </p>
            </div>
            <Switch
              checked={formData.themeOptions.allowUserToggle}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  themeOptions: {
                    ...formData.themeOptions,
                    allowUserToggle: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* 5. Footer & CV File */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-base text-foreground">
            Footer Text & Resume (CV) Document
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            Legal copyright statement and downloadable resume link
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Footer Text
            </label>
            <Input
              value={formData.footerText}
              onChange={(e) =>
                setFormData({ ...formData, footerText: e.target.value })
              }
              placeholder="© 2026 Lonnex Njenga. All rights reserved."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Resume (CV) Document URL
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.cvUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cvUrl: e.target.value || null })
                  }
                  placeholder="/cv-placeholder.pdf or Cloudinary asset URL"
                  className="pl-9"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Media</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <HexButton
          type="submit"
          variant="default"
          size="default"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5 inline" />
              Save Settings
            </>
          )}
        </HexButton>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          assets={mediaAssets}
          onSelect={(selected) => {
            if (selected.length > 0) {
              setFormData({ ...formData, cvUrl: resolveMediaUrl(selected[0].publicId) });
            }
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </form>
  );
}
