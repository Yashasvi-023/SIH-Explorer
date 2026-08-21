from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ProblemStatement


router = APIRouter(
    prefix="/problems",
    tags=["Problems"]
)


@router.get("/")
def get_problems(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    theme: str | None = Query(default=None),
    sort: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(ProblemStatement)

    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ProblemStatement.title.ilike(search_term)) |
            (ProblemStatement.organization.ilike(search_term)) |
            (ProblemStatement.ps_number.ilike(search_term))
        )

    # Category filter
    if category:
        query = query.filter(ProblemStatement.category == category)

    # Theme filter
    if theme:
        query = query.filter(ProblemStatement.theme == theme)

    # Total count after filters
    total = query.count()

    # Sorting
    if sort == "title":
        query = query.order_by(ProblemStatement.title.asc())
    elif sort == "ideas":
        query = query.order_by(ProblemStatement.idea_count.desc())
    elif sort == "deadline":
        query = query.order_by(ProblemStatement.deadline.asc())
    else:
        query = query.order_by(ProblemStatement.id.asc())

    # Paginate results
    offset = (page - 1) * page_size
    results = query.offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": results
    }


@router.get("/{ps_number}")
def get_problem(
    ps_number: str,
    db: Session = Depends(get_db)
):
    problem = (
        db.query(ProblemStatement)
        .filter(ProblemStatement.ps_number == ps_number)
        .first()
    )

    if not problem:
        return {"error": "Problem statement not found"}

    return problem