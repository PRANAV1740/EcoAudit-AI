"""
Seed Script — Load sample data into the persistence store.
Runs automatically on startup if the store is empty.
"""

import json
from pathlib import Path

from ..services.persistence import PersistenceStore

SAMPLE_DIR = Path(__file__).parent


async def seed_sample_data(store: PersistenceStore) -> None:
    """Load sample trees and reports if the store is empty."""

    # Seed trees
    existing_trees = await store.get_all("trees")
    if not existing_trees:
        sample_trees_path = SAMPLE_DIR / "sample_trees.json"
        if sample_trees_path.exists():
            with open(sample_trees_path, "r", encoding="utf-8") as f:
                trees = json.load(f)
            for tree in trees:
                await store.create("trees", tree)
            print(f"[seed] Loaded {len(trees)} sample trees")

    # Seed reports
    existing_reports = await store.get_all("reports")
    if not existing_reports:
        sample_reports_path = SAMPLE_DIR / "sample_reports.json"
        if sample_reports_path.exists():
            with open(sample_reports_path, "r", encoding="utf-8") as f:
                reports = json.load(f)
            for report in reports:
                await store.create("reports", report)
            print(f"[seed] Loaded {len(reports)} sample reports")
