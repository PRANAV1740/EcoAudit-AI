
"""Photo upload endpoint with file validation, EXIF extraction, and canopy analysis."""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from ..models.schemas import (
    PhotoRecord,
    PhotoUploadResponse,
    CanopyAnalysis,
)
from ..services.persistence import PersistenceStore
from ..services.image.exif_extractor import extract_exif
from ..services.image.canopy_analyzer import analyze_canopy_image
from ..services.geo.risk_classifier import classify_risk
from ..dependencies import get_store, get_upload_dir

router = APIRouter()

# Allowed MIME types and extensions
ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_MB", "20")) * 1024 * 1024


def _validate_file(file: UploadFile) -> None:
    """Validate the uploaded file type and extension."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File type '{file.content_type}' not allowed. "
                f"Accepted: {', '.join(sorted(ALLOWED_TYPES))}"
            ),
        )

    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"File extension '{ext}' not allowed. "
                    f"Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
                ),
            )


@router.post(
    "/photos/upload",
    response_model=PhotoUploadResponse,
    status_code=201,
)
async def upload_photo(
    file: UploadFile = File(...),
    store: PersistenceStore = Depends(get_store),
    upload_dir: Path = Depends(get_upload_dir),
):
    """Upload a photo, extract EXIF metadata, and estimate canopy health."""

    _validate_file(file)

    # Read and validate file size
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File too large ({len(content) / (1024 * 1024):.1f} MB). "
                f"Maximum: {MAX_FILE_SIZE / (1024 * 1024):.0f} MB"
            ),
        )

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Generate a unique filename
    photo_id = uuid.uuid4().hex[:12]
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    stored_filename = f"{photo_id}{ext}"

    # Ensure the upload directory exists
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save the uploaded file
    file_path = upload_dir / stored_filename

    try:
        with open(file_path, "wb") as output_file:
            output_file.write(content)
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not save the uploaded image.",
        ) from exc

    # Extract EXIF metadata
    exif_data = extract_exif(content)
    has_gps = exif_data is not None and exif_data.gps_coords is not None

    # Analyze the actual image using the existing OpenCV heuristic
    analysis = None
    analysis_message = ""

    try:
        raw_analysis = analyze_canopy_image(content)

        # The analyzer's fallback result has total_pixels == 0.
        # Do not treat fallback scores as a successful analysis.
        if raw_analysis["total_pixels"] > 0:
            analysis = CanopyAnalysis(
                **raw_analysis,
                risk_class=classify_risk(raw_analysis["health_score"]),
            )
        else:
            analysis_message = (
                " Canopy analysis could not be completed for this image."
            )
    except Exception:
        # Preserve the uploaded photo even if analysis fails.
        analysis_message = (
            " Photo saved, but canopy analysis could not be completed."
        )

    # Build the photo record
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
        analysis=analysis,
    )

    # Persist photo metadata and analysis
    try:
        await store.create("photos", record.model_dump(mode="json"))
    except Exception as exc:
        # Avoid leaving an orphaned image if metadata persistence fails.
        try:
            file_path.unlink(missing_ok=True)
        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail="Photo metadata could not be saved.",
        ) from exc

    # Build a helpful response message
    if has_gps:
        coords = exif_data.gps_coords
        gps_msg = (
            f" GPS coordinates extracted: "
            f"({coords.latitude:.6f}, {coords.longitude:.6f})."
        )
    else:
        gps_msg = " No GPS metadata found."

    if analysis is not None:
        analysis_msg = (
            f" Canopy analysis completed using computer vision. "
            f"Estimated canopy cover: {analysis.canopy_cover_pct:.1f}%; "
            f"estimated health score: {analysis.health_score:.1f}/100; "
            f"risk class: {analysis.risk_class.value}."
        )
    else:
        analysis_msg = analysis_message

    return PhotoUploadResponse(
        **record.model_dump(),
        message=f"Photo uploaded successfully.{gps_msg}{analysis_msg}",
    )


@router.get("/photos", response_model=list[PhotoRecord])
async def list_photos(
    store: PersistenceStore = Depends(get_store),
):
    """Return all uploaded photo records, including analysis when available."""
    photos = await store.get_all("photos")
    return [PhotoRecord(**photo) for photo in photos]
