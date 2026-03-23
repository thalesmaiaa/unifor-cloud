from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse
from app.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/api/logs", tags=["Activity Logs"])


@router.get("/", response_model=List[ActivityLogResponse])
def list_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    resource_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin),
):
    """List activity logs (admin only)."""
    query = db.query(ActivityLog)

    if resource_type:
        query = query.filter(ActivityLog.resource_type == resource_type)
    if action:
        query = query.filter(ActivityLog.action == action)

    logs = query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/my", response_model=List[ActivityLogResponse])
def list_my_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List current user's activity logs."""
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return logs
