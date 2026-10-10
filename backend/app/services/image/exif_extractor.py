"""
EXIF Metadata Extractor
=======================

Extracts EXIF metadata (camera info, GPS coordinates) from uploaded
images using Pillow. Handles missing or malformed GPS data gracefully.
"""

import io
from typing import Optional

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

from ...models.schemas import ExifData, GPSCoords


def _convert_to_degrees(value) -> float:
    """Convert EXIF GPS coordinate (degrees, minutes, seconds) to decimal degrees."""
    d = float(value[0])
    m = float(value[1])
    s = float(value[2])
    return d + (m / 60.0) + (s / 3600.0)


def _extract_gps(exif: dict) -> Optional[GPSCoords]:
    """Extract GPS coordinates from parsed EXIF data. Returns None if unavailable."""
    gps_info = exif.get("GPSInfo")
    if not gps_info:
        return None

    gps_data = {}
    for key, val in gps_info.items():
        tag = GPSTAGS.get(key, key)
        gps_data[tag] = val

    try:
        lat = _convert_to_degrees(gps_data["GPSLatitude"])
        if gps_data.get("GPSLatitudeRef", "N") == "S":
            lat = -lat

        lng = _convert_to_degrees(gps_data["GPSLongitude"])
        if gps_data.get("GPSLongitudeRef", "E") == "W":
            lng = -lng

        alt = None
        if "GPSAltitude" in gps_data:
            alt = float(gps_data["GPSAltitude"])
            if gps_data.get("GPSAltitudeRef", 0) == 1:
                alt = -alt

        return GPSCoords(latitude=lat, longitude=lng, altitude=alt)

    except (KeyError, TypeError, ZeroDivisionError, ValueError, IndexError):
        # GPS data present but incomplete or malformed
        return None


def extract_exif(image_bytes: bytes) -> Optional[ExifData]:
    """Extract EXIF data from raw image bytes.

    Returns an ExifData object (possibly with all-None fields) if the image
    can be read, or None if the image is completely unreadable.
    GPS metadata is extracted on a best-effort basis — missing GPS is
    reported as gps_coords=None rather than raising an error.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size

        exif_raw = img._getexif()
        if not exif_raw:
            return ExifData(image_width=width, image_height=height)

        # Parse tag names
        exif: dict = {}
        for tag_id, value in exif_raw.items():
            tag = TAGS.get(tag_id, tag_id)
            exif[tag] = value

        gps_coords = _extract_gps(exif)

        datetime_orig = exif.get("DateTimeOriginal")

        return ExifData(
            camera_make=str(exif["Make"]).strip() if "Make" in exif else None,
            camera_model=str(exif["Model"]).strip() if "Model" in exif else None,
            datetime_original=str(datetime_orig) if datetime_orig else None,
            gps_coords=gps_coords,
            image_width=exif.get("ImageWidth") or width,
            image_height=exif.get("ImageLength") or height,
        )

    except Exception:
        # Image unreadable or corrupt — return None, don't crash
        return None
