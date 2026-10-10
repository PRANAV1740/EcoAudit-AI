"""Photo upload endpoint with file validation and EXIF extraction."""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from ..models.schemas import PhotoRecord, PhotoUploadResponse
from ..services.persistence import PersistenceStore
from ..services.image.exif_extractor import extract_exif
from ..dependencies import get_store, get_upload_dir

router = APIRouter()

# Allowed MIME types and extensions
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/tiff", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_MB", "20")) * 1024 * 1024  # bytes


def _validate_file(file: UploadFile) -> None:
    """Validate uploaded file type and extension."""
    # Check content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
            f"Accepted: {', '.join(sorted(ALLOWED_TYPES))}",
        )

    # Check extension
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{ext}' not allowed. "
                f"Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            )


@router.post("/photos/upload", response_model=PhotoUploadResponse, status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    store: PersistenceStore = Depends(get_store),
    upload_dir: Path = Depends(get_upload_dir),
):
    """Upload a plantation photo with automatic EXIF extraction.

    - Validates file type (JPEG, PNG, TIFF, WebP) and size (≤20 MB).
    - Extracts EXIF metadata including GPS coordinates when available.
    - Stores the file on disk and metadata in the persistence layer.
    - Missing GPS data is reported gracefully (has_gps=false), not as an error.
    """
    _validate_file(file)

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) / 1024 / 1024:.1f} MB). "
            f"Maximum: {MAX_FILE_SIZE / 1024 / 1024:.0f} MB",
        )

    # Generate unique filename
    photo_id = uuid.uuid4().hex[:12]
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    stored_filename = f"{photo_id}{ext}"

    # Save file to disk
    file_path = upload_dir / stored_filename
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract EXIF metadata
    exif_data = extract_exif(content)
    has_gps = exif_data is not None and exif_data.gps_coords is not None

    # Build record
    now = datetime.now(timezone.utc)
    record = PhotoRecord(
        id=photo_id,
        filename=stored_filename,
        original_filename=file.filename or "unknown",
        file_size_bytes=len(content),
        content_type=file.content_type or "image/jpeg",
        uploaded_at=now,
        exif_data=exif_data,
        has_gps=has_gps,
    )

    # Persist metadata
    await store.create("photos", record.model_dump())

    # Build response with helpful message
    gps_msg = ""
    if has_gps:
        coords = exif_data.gps_coords
        gps_msg = f" GPS coordinates extracted: ({coords.latitude:.6f}, {coords.longitude:.6f})."
    else:
        gps_msg = " No GPS metadata found — you can set coordinates manually."

    return PhotoUploadResponse(
        **record.model_dump(),
        message=f"Photo uploaded successfully.{gps_msg}",
    )


@router.get("/photos", response_model=list[PhotoRecord])
async def list_photos(store: PersistenceStore = Depends(get_store)):
    """Return all uploaded photo records."""
    photos = await store.get_all("photos")
    return [PhotoRecord(**p) for p in photos]
