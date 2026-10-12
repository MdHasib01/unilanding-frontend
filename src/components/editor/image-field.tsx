'use client';

/* eslint-disable @next/next/no-img-element -- previews of uploads from any host */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImageIcon, Images, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api-client';
import { ACCEPT_IMAGES, uploadImage, type MediaAsset } from '@/lib/media-client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FieldShell, inputCls } from './fields';

export type ImageValue = { url?: string; publicId?: string; alt?: string };

/**
 * An image slot: thumbnail, upload, pick from the media library, paste a URL,
 * or clear it. Uploads go to the tenant's media library (Cloudinary, or local
 * disk in development), so every image a tenant ever uploaded is reusable.
 */
export function ImageField({
  id,
  label,
  help,
  value,
  onChange,
  tenantSlug,
  fallbackUrl,
  disabled,
}: {
  id: string;
  label: string;
  help?: string;
  value: ImageValue | undefined;
  onChange: (next: ImageValue) => void;
  tenantSlug: string;
  /** Shown faintly when empty, so the tenant sees what renders instead. */
  fallbackUrl?: string;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pasting, setPasting] = useState(false);
  const url = value?.url?.trim() || '';

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadImage(file, tenantSlug);
      onChange({ url: asset.url, publicId: asset.publicId });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <FieldShell label={label} help={help} htmlFor={id}>
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-3">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          {url ? (
            <img src={url} alt="" className="size-full object-contain" />
          ) : fallbackUrl ? (
            <img src={fallbackUrl} alt="" className="size-full object-contain opacity-35" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground/50" />
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-[11px] text-muted-foreground">
            {url ? url.split('/').pop() : fallbackUrl ? 'Using the default image' : 'No image'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <input
              ref={fileRef}
              id={id}
              type="file"
              accept={ACCEPT_IMAGES}
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <SmallButton onClick={() => fileRef.current?.click()} disabled={disabled || uploading} primary>
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              Upload
            </SmallButton>
            <SmallButton onClick={() => setLibraryOpen(true)} disabled={disabled}>
              <Images className="size-3.5" />
              Library
            </SmallButton>
            <SmallButton onClick={() => setPasting((v) => !v)} disabled={disabled}>
              <Link2 className="size-3.5" />
              URL
            </SmallButton>
            {url ? (
              <SmallButton onClick={() => onChange({ url: '', publicId: '' })} disabled={disabled} danger>
                <Trash2 className="size-3.5" />
                Remove
              </SmallButton>
            ) : null}
          </div>
          {pasting ? (
            <input
              type="url"
              placeholder="https://…"
              defaultValue={url}
              disabled={disabled}
              className={cn(inputCls, 'py-1.5 text-xs')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v && !/^(https?:\/\/|\/)/i.test(v)) {
                    toast.error('Use an http(s) link');
                    return;
                  }
                  onChange({ url: v, publicId: '' });
                  setPasting(false);
                }
              }}
            />
          ) : null}
        </div>
      </div>

      {libraryOpen ? (
        <MediaLibrary
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          tenantSlug={tenantSlug}
          onPick={(asset) => {
            onChange({ url: asset.url, publicId: asset.publicId });
            setLibraryOpen(false);
          }}
        />
      ) : null}
    </FieldShell>
  );
}

function SmallButton({
  children,
  onClick,
  disabled,
  primary,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        primary
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : danger
            ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
            : 'border-border bg-card text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function MediaLibrary({
  open,
  onOpenChange,
  tenantSlug,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantSlug: string;
  onPick: (asset: MediaAsset) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Mounted only while open (see ImageField), so every open fetches afresh and
  // an image uploaded a moment ago is already there.
  useEffect(() => {
    let live = true;
    api
      .get<MediaAsset[]>('/t/media', { tenantSlug })
      .then((list) => live && setAssets(list))
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Could not load the library'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [tenantSlug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Every image you have uploaded. Pick one to use it here.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : assets && assets.length > 0 ? (
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onPick(a)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40 transition hover:border-primary hover:ring-2 hover:ring-primary/20"
                title={a.originalFilename}
              >
                <img src={a.url} alt={a.originalFilename} className="size-full object-contain p-1.5" loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No uploads yet — use Upload on any image field.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
