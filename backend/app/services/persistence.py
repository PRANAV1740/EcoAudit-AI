"""
Persistence Layer — Abstract Interface + JSON File Implementation
=================================================================

All data access goes through the PersistenceStore interface.
To migrate to PostgreSQL/PostGIS, implement a new class that
inherits from PersistenceStore and swap it in `dependencies.py`.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
import json
from pathlib import Path
import threading


class PersistenceStore(ABC):
    """Abstract persistence interface.

    Every router uses this interface via dependency injection.
    Swap the concrete implementation in dependencies.py to migrate
    from JSON files to PostgreSQL without changing any router code.
    """

    @abstractmethod
    async def get_all(self, collection: str) -> List[dict]:
        """Return all items in a collection."""
        ...

    @abstractmethod
    async def get_by_id(self, collection: str, item_id: str) -> Optional[dict]:
        """Return a single item by ID, or None."""
        ...

    @abstractmethod
    async def create(self, collection: str, data: dict) -> dict:
        """Insert a new item and return it."""
        ...

    @abstractmethod
    async def update(self, collection: str, item_id: str, data: dict) -> Optional[dict]:
        """Update an existing item. Returns updated item or None if not found."""
        ...

    @abstractmethod
    async def delete(self, collection: str, item_id: str) -> bool:
        """Delete an item by ID. Returns True if deleted."""
        ...

    @abstractmethod
    async def count(self, collection: str) -> int:
        """Return the number of items in a collection."""
        ...

    @abstractmethod
    async def clear(self, collection: str) -> None:
        """Remove all items from a collection."""
        ...


class JsonFileStore(PersistenceStore):
    """JSON file-based persistence.

    Each collection is stored as a separate JSON file.
    Thread-safe via a per-collection lock.
    """

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self._locks: dict[str, threading.Lock] = {}

    def _get_lock(self, collection: str) -> threading.Lock:
        if collection not in self._locks:
            self._locks[collection] = threading.Lock()
        return self._locks[collection]

    def _file_path(self, collection: str) -> Path:
        return self.data_dir / f"{collection}.json"

    def _load(self, collection: str) -> List[dict]:
        fp = self._file_path(collection)
        if not fp.exists():
            return []
        with open(fp, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self, collection: str, data: List[dict]) -> None:
        with open(self._file_path(collection), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str, ensure_ascii=False)

    async def get_all(self, collection: str) -> List[dict]:
        with self._get_lock(collection):
            return self._load(collection)

    async def get_by_id(self, collection: str, item_id: str) -> Optional[dict]:
        with self._get_lock(collection):
            for item in self._load(collection):
                if item.get("id") == item_id:
                    return item
        return None

    async def create(self, collection: str, data: dict) -> dict:
        with self._get_lock(collection):
            items = self._load(collection)
            items.append(data)
            self._save(collection, items)
        return data

    async def update(self, collection: str, item_id: str, data: dict) -> Optional[dict]:
        with self._get_lock(collection):
            items = self._load(collection)
            for i, item in enumerate(items):
                if item.get("id") == item_id:
                    items[i] = {**item, **data}
                    self._save(collection, items)
                    return items[i]
        return None

    async def delete(self, collection: str, item_id: str) -> bool:
        with self._get_lock(collection):
            items = self._load(collection)
            filtered = [item for item in items if item.get("id") != item_id]
            if len(filtered) < len(items):
                self._save(collection, filtered)
                return True
        return False

    async def count(self, collection: str) -> int:
        with self._get_lock(collection):
            return len(self._load(collection))

    async def clear(self, collection: str) -> None:
        with self._get_lock(collection):
            self._save(collection, [])
