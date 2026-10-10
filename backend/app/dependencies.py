"""
Dependency injection for FastAPI routes.

Provides the persistence store and upload directory as injectable
dependencies, making it easy to swap implementations (e.g. JSON -> PostgreSQL).
"""

from pathlib import Path
from .services.persistence import JsonFileStore, PersistenceStore

DATA_DIR = Path(__file__).parent / "data" / "store"
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_store = JsonFileStore(DATA_DIR)


def get_store() -> PersistenceStore:
    """Get the active persistence store. Swap implementation here for migration."""
    return _store


def get_upload_dir() -> Path:
    """Get the upload directory path."""
    return UPLOAD_DIR
