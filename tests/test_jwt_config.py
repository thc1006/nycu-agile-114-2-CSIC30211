"""Config hardening (#8): the JWT signing key must be strong and explicit.

The app must refuse to start with a missing, placeholder, or too-short secret —
it must never silently sign tokens with a guessable key.
"""

import pytest
from pydantic import ValidationError

from app.config import Settings

VALID_SECRET = "a-sufficiently-long-and-unique-jwt-secret-1234567890"


def test_accepts_a_strong_secret():
    settings = Settings(JWT_SECRET_KEY=VALID_SECRET)
    assert settings.JWT_SECRET_KEY == VALID_SECRET


@pytest.mark.parametrize(
    "bad_secret",
    [
        "short",                      # < 32 bytes
        "dev-secret-key",             # known placeholder (old default)
        "change-this-in-production",  # known placeholder (old .env value)
        "",                           # empty
    ],
)
def test_rejects_weak_or_short_secret(bad_secret):
    with pytest.raises(ValidationError):
        Settings(JWT_SECRET_KEY=bad_secret)
