from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.activity_log import ActivityLog
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _project_to_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        owner_id=project.owner_id,
        owner=project.owner,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=len(project.tasks) if project.tasks else 0,
    )


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project."""
    project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    log = ActivityLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="project",
        resource_id=project.id,
        details=f"Created project: {project.name}",
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)
    db.commit()

    return _project_to_response(project)


@router.get("/", response_model=ProjectListResponse)
def list_projects(
    status: Optional[ProjectStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List projects. Admins see all; users see their own."""
    query = db.query(Project)

    if current_user.role.value != "admin":
        query = query.filter(Project.owner_id == current_user.id)

    if status:
        query = query.filter(Project.status == status)

    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))

    total = query.count()
    projects = query.order_by(Project.updated_at.desc()).offset(skip).limit(limit).all()

    return ProjectListResponse(
        projects=[_project_to_response(p) for p in projects],
        total=total,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role.value != "admin" and project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return _project_to_response(project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role.value != "admin" and project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    log = ActivityLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="project",
        resource_id=project.id,
        details=f"Updated project: {project.name}",
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)
    db.commit()

    return _project_to_response(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project and all its tasks."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role.value != "admin" and project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    log = ActivityLog(
        user_id=current_user.id,
        action="DELETE",
        resource_type="project",
        resource_id=project.id,
        details=f"Deleted project: {project.name}",
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)

    db.delete(project)
    db.commit()
