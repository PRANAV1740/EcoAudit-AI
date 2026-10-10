"use client";

import React, { useState, useEffect, useRef } from "react";
import { uploadPhoto, getPhotos } from "@/lib/api";
import type { PhotoRecord, PhotoUploadResponse } from "@/lib/types";

export default function UploadPage() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<PhotoUploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const list = await getPhotos();
        setPhotos(list);
      } catch (err) {
        console.error("Failed to load photos:", err);
      }
    }
    loadPhotos();
  }, []);

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);
    setUploadResult(null);

    // File validation: format & size
    const validTypes = ["image/jpeg", "image/png", "image/tiff", "image/webp"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|tiff?|webp)$/i)) {
      setErrorMessage("Invalid file type. Only JPEG, PNG, and TIFF drone images are supported.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds 25 MB limit. Please select a smaller field image.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await uploadPhoto(selectedFile);
      setUploadResult(res);
      setPhotos((prev) => [res, ...prev]);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process photo upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Aerial & Field Photo Ingestion
          </h1>
          <span className="demo-badge">EXIF Engine</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Upload UAV orthomosaics and multispectral survey images for EXIF extraction and AI health segmentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Zone & Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-1">
              Select or Drop Photo
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Automatic EXIF extraction will parse camera model, timestamp, and RTK GPS coordinates.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-accent bg-accent/10"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-accent/40 bg-bg-secondary/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/tiff,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 mx-auto rounded-xl bg-bg-card flex items-center justify-center text-accent mb-3 shadow-md">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
              </div>

              {selectedFile ? (
                <div>
                  <span className="text-sm font-bold text-emerald-400 block break-all">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-text-muted mt-1 block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-semibold text-text-primary block">
                    Drag and drop drone image here
                  </span>
                  <span className="text-xs text-text-muted mt-1 block">
                    or click to browse from file system
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider mt-3 block font-mono">
                    Supports JPEG, PNG, TIFF (Max 25MB)
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Action Button */}
            <button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || isUploading}
              className={`mt-4 w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                selectedFile && !isUploading
                  ? "bg-accent text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-bg-card-hover text-text-muted cursor-not-allowed border border-border"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing & Extracting EXIF...</span>
                </>
              ) : (
                <span>Upload & Analyze Image</span>
              )}
            </button>
          </div>

          {/* Upload Success Alert */}
          {uploadResult && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs animate-fade-in space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{uploadResult.message || "Upload successful!"}</span>
              </div>

              {uploadResult.exif_data ? (
                <div className="p-3 rounded-xl bg-bg-card/70 border border-emerald-500/20 space-y-1.5 font-mono text-[11px]">
                  <div className="text-text-muted uppercase text-[10px] font-bold">Extracted EXIF</div>
                  {uploadResult.exif_data.camera_model && (
                    <div className="text-text-secondary">
                      Camera: <span className="text-text-primary">{uploadResult.exif_data.camera_model}</span>
                    </div>
                  )}
                  {uploadResult.exif_data.gps_coords ? (
                    <div className="text-emerald-400">
                      GPS: {uploadResult.exif_data.gps_coords.latitude.toFixed(5)}°N, {uploadResult.exif_data.gps_coords.longitude.toFixed(5)}°E
                    </div>
                  ) : (
                    <div className="text-amber-400 font-sans">
                      ⚠️ No GPS metadata found in EXIF — tree location will require manual coordinates.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-amber-400 font-sans">
                  ⚠️ No EXIF metadata detected in image.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Uploaded Photos Inventory */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
                  Ingested Field Images
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Processed survey images with EXIF validation status
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                {photos.length} Images
              </span>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <svg className="w-10 h-10 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-semibold text-text-secondary">No photos uploaded yet</p>
                <p className="text-[11px] text-text-muted mt-1">Upload a drone photo using the dropzone</p>
              </div>
            ) : (
              <div className="space-y-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-4 rounded-xl bg-bg-secondary/70 border border-border hover:border-border-light transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-semibold text-text-primary block break-all">
                          {photo.original_filename || photo.filename}
                        </span>
                        <span className="text-[11px] text-text-muted font-mono">
                          ID: {photo.id} · {(photo.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                          photo.has_gps
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {photo.has_gps ? "GPS Geocoded" : "No GPS Metadata"}
                      </span>
                    </div>

                    {photo.exif_data && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-bg-card border border-border/50 text-[11px] text-text-secondary font-mono mt-2">
                        <div>
                          <span className="text-[10px] text-text-muted uppercase block font-sans">Camera</span>
                          <span className="truncate block">{photo.exif_data.camera_model || "Generic UAV"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase block font-sans">Timestamp</span>
                          <span className="truncate block">
                            {photo.exif_data.datetime_original
                              ? new Date(photo.exif_data.datetime_original).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase block font-sans">Coordinates</span>
                          <span className="truncate block text-accent">
                            {photo.exif_data.gps_coords
                              ? `${photo.exif_data.gps_coords.latitude.toFixed(3)}°, ${photo.exif_data.gps_coords.longitude.toFixed(3)}°`
                              : "Missing GPS"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
