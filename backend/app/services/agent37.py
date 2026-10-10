"""
Agent37 Integration — PLACEHOLDER
==================================

⚠️  NOT YET CONNECTED  ⚠️

This module provides a stub interface for Agent37 integration.
It defines the expected API surface so that other modules can
import and use it, but all methods currently return placeholder
responses.

Before connecting:
1. Verify Agent37 API endpoint and authentication requirements
2. Add AGENT37_API_URL and AGENT37_API_KEY to .env
3. Implement the actual HTTP client in _call_agent37()
4. Add integration tests

Do NOT remove the placeholder guards until the real API is tested.
"""

import os
from typing import Any, Optional


# Configuration (read from environment when available)
AGENT37_API_URL: Optional[str] = os.getenv("AGENT37_API_URL")
AGENT37_API_KEY: Optional[str] = os.getenv("AGENT37_API_KEY")

_CONNECTED = False  # Set to True once real integration is verified


def is_connected() -> bool:
    """Check whether Agent37 is actually connected and configured."""
    return _CONNECTED and AGENT37_API_URL is not None


async def analyze_image(image_path: str) -> dict[str, Any]:
    """Send an image to Agent37 for AI analysis.

    ⚠️  PLACEHOLDER — returns mock response.
    """
    if not is_connected():
        return {
            "status": "placeholder",
            "message": "Agent37 is not yet connected. This is a placeholder response.",
            "analysis": None,
        }

    # TODO: Implement real Agent37 API call
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(
    #         f"{AGENT37_API_URL}/analyze",
    #         headers={"Authorization": f"Bearer {AGENT37_API_KEY}"},
    #         files={"image": open(image_path, "rb")},
    #     )
    #     return response.json()

    return {"status": "placeholder", "message": "Not implemented", "analysis": None}


async def get_recommendations(audit_data: dict) -> dict[str, Any]:
    """Get AI recommendations from Agent37 based on audit data.

    ⚠️  PLACEHOLDER — returns mock response.
    """
    if not is_connected():
        return {
            "status": "placeholder",
            "message": "Agent37 is not yet connected. This is a placeholder response.",
            "recommendations": [],
        }

    return {"status": "placeholder", "message": "Not implemented", "recommendations": []}
