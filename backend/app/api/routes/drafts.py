"""Draft auto-save API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.sql import User, TemplateDraft

router = APIRouter()


class DraftPayload(BaseModel):
    field_data: Dict[str, str]


class DraftResponse(BaseModel):
    template_id: str
    field_data: Dict[str, str]
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/{template_id:path}")
def get_draft(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return saved draft for the current user + template, or null."""
    draft = (
        db.query(TemplateDraft)
        .filter(
            TemplateDraft.user_id == current_user.id,
            TemplateDraft.template_id == template_id,
        )
        .first()
    )
    if not draft:
        return None
    return DraftResponse(
        template_id=draft.template_id,
        field_data=draft.field_data or {},
        updated_at=draft.updated_at.isoformat() if draft.updated_at else None,
    )


@router.post("/{template_id:path}")
def save_draft(
    template_id: str,
    payload: DraftPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upsert draft for the current user + template."""
    draft = (
        db.query(TemplateDraft)
        .filter(
            TemplateDraft.user_id == current_user.id,
            TemplateDraft.template_id == template_id,
        )
        .first()
    )
    if draft:
        draft.field_data = payload.field_data
        draft.updated_at = datetime.utcnow()
    else:
        draft = TemplateDraft(
            user_id=current_user.id,
            template_id=template_id,
            field_data=payload.field_data,
        )
        db.add(draft)
    db.commit()
    return {"status": "saved"}


@router.delete("/{template_id:path}")
def delete_draft(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete draft, returning the user to a clean state."""
    draft = (
        db.query(TemplateDraft)
        .filter(
            TemplateDraft.user_id == current_user.id,
            TemplateDraft.template_id == template_id,
        )
        .first()
    )
    if draft:
        db.delete(draft)
        db.commit()
    return {"status": "deleted"}
