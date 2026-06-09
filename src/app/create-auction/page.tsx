"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { createAuction } from "@/actions/auction";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  DURATION_OPTIONS,
  formatCurrency,
} from "@/lib/utils";
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  ImagePlus,
  Check,
  Loader2,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Camera,
} from "lucide-react";

const STEPS = ["Details", "Images", "Pricing", "Review"];

export default function CreateAuctionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    images: [] as string[], // base64 or URLs
    imageFiles: [] as File[],
    startingBid: "",
    durationHours: 24,
  });

  function update(key: keyof typeof form, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (form.images.length + files.length > 6) {
      toast.error("Maximum 6 images allowed.");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
          imageFiles: [...prev.imageFiles, file],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  }

  function canProceed() {
    if (step === 0) return form.title.length >= 5 && form.description.length >= 20 && form.category && form.condition;
    if (step === 1) return form.images.length >= 1;
    if (step === 2) return parseFloat(form.startingBid) >= 1;
    return true;
  }

  function handleSubmit() {
    startTransition(async () => {
      // 1. Upload files first
      let uploadedUrls: string[] = [];
      if (form.imageFiles.length > 0) {
        const formData = new FormData();
        form.imageFiles.forEach((file) => {
          formData.append("files", file);
        });

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to upload images.");
            return;
          }
          uploadedUrls = data.urls;
        } catch {
          toast.error("Failed to upload images. Please check connection.");
          return;
        }
      }

      // 2. Submit auction with final uploaded URLs
      const result = await createAuction({
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        images: uploadedUrls,
        startingBid: parseFloat(form.startingBid),
        durationHours: form.durationHours,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Auction created! 🎉");
        router.push(`/auctions/${result.auctionId}`);
      }
    });
  }

  return (
    <div className="app-page flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="page-container max-w-2xl mx-auto">
          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
              Create Auction
            </h1>
            <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
              List your item and let your campus community bid on it.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-10">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: i < step ? "hsl(142 71% 45%)" : i === step ? "hsl(239 84% 67%)" : "hsl(222 47% 15%)",
                      color: i <= step ? "white" : "hsl(215 20% 45%)",
                    }}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className="text-sm font-medium hidden sm:block"
                    style={{ color: i === step ? "hsl(213 31% 85%)" : "hsl(215 20% 45%)" }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-3"
                    style={{ background: i < step ? "hsl(142 71% 45%)" : "hsl(222 47% 15%)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div
            className="rounded-2xl p-8 animate-slide-up"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Step 0: Details */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6" style={{ color: "hsl(239 84% 70%)" }}>
                  <h2 className="text-lg font-semibold">Item Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "hsl(213 31% 80%)" }}>
                    Title <span style={{ color: "hsl(0 84% 65%)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. MacBook Pro M2, barely used"
                    className="input-base"
                    maxLength={150}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: "hsl(215 20% 40%)" }}>
                    {form.title.length}/150
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "hsl(213 31% 80%)" }}>
                    Description <span style={{ color: "hsl(0 84% 65%)" }}>*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe the item — condition, features, why you're selling, included accessories…"
                    className="input-base resize-none"
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: "hsl(215 20% 40%)" }}>
                    {form.description.length}/2000
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "hsl(213 31% 80%)" }}>
                      Category <span style={{ color: "hsl(0 84% 65%)" }}>*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="input-base"
                    >
                      <option value="">Select…</option>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "hsl(213 31% 80%)" }}>
                      Condition <span style={{ color: "hsl(0 84% 65%)" }}>*</span>
                    </label>
                    <select
                      value={form.condition}
                      onChange={(e) => update("condition", e.target.value)}
                      className="input-base"
                    >
                      <option value="">Select…</option>
                      {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Images */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6" style={{ color: "hsl(239 84% 70%)" }}>
                  <ImagePlus className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Add Photos</h2>
                </div>

                <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                  Upload 1–6 photos. Clear, well-lit photos get more bids.
                </p>

                {/* Upload area */}
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.12)" }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleImageUpload(fakeEvent);
                  }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(215 20% 40%)" }} />
                  <p className="text-sm font-medium mb-1">Drag photos here or use the buttons below</p>
                  <p className="text-xs mb-5" style={{ color: "hsl(215 20% 45%)" }}>
                    JPG, PNG, WebP · Max 10MB each · Up to 6 photos
                  </p>

                  {/* Action buttons: Upload + Camera */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "hsl(239 84% 75%)",
                      }}
                    >
                      <ImagePlus className="w-4 h-4" />
                      Upload Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "rgba(245,167,30,0.12)",
                        border: "1px solid rgba(245,167,30,0.3)",
                        color: "hsl(42 95% 65%)",
                      }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Image previews */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-semibold"
                            style={{ background: "rgba(99,102,241,0.8)" }}
                          >
                            Main
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 6 && (
                      <div className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                          title="Upload photo"
                        >
                          <ImagePlus className="w-5 h-5" style={{ color: "hsl(215 20% 40%)" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                          title="Take photo"
                        >
                          <Camera className="w-5 h-5" style={{ color: "hsl(42 95% 60%)" }} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Pricing */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6" style={{ color: "hsl(239 84% 70%)" }}>
                  <DollarSign className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Set Pricing</h2>
                </div>

                {/* Starting bid */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "hsl(213 31% 80%)" }}>
                    Starting Bid <span style={{ color: "hsl(0 84% 65%)" }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "hsl(215 20% 50%)" }}>₹</span>
                    <input
                      type="number"
                      value={form.startingBid}
                      onChange={(e) => update("startingBid", e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      className="input-base pl-8 text-xl font-semibold"
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>
                    Tip: Lower starting bids attract more initial interest.
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "hsl(213 31% 80%)" }}>
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    Auction Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => update("durationHours", opt.hours)}
                        className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: form.durationHours === opt.hours ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${form.durationHours === opt.hours ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: form.durationHours === opt.hours ? "hsl(239 84% 75%)" : "hsl(215 20% 55%)",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6" style={{ color: "hsl(142 71% 45%)" }}>
                  <Check className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Review & Publish</h2>
                </div>

                {/* Preview */}
                {form.images[0] && (
                  <img
                    src={form.images[0]}
                    alt="Main"
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                )}

                <div className="space-y-3">
                  {[
                    { label: "Title", value: form.title },
                    { label: "Category", value: CATEGORY_LABELS[form.category] },
                    { label: "Condition", value: CONDITION_LABELS[form.condition] },
                    { label: "Photos", value: `${form.images.length} photo(s)` },
                    { label: "Starting Bid", value: formatCurrency(parseFloat(form.startingBid)) },
                    { label: "Duration", value: DURATION_OPTIONS.find((d) => d.hours === form.durationHours)?.label },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "hsl(215 20% 45%)" }}>{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="btn btn-primary"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="btn btn-primary"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Publish Auction
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
