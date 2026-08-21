from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base


class ProblemStatement(Base):

    __tablename__ = "problem_statements"

    id = Column(Integer, primary_key=True, index=True)

    ps_number = Column(String, unique=True, index=True)

    organization = Column(String)

    title = Column(String)

    category = Column(String)

    idea_count = Column(Integer, default=0)

    idea_limit = Column(Integer, default=500)

    theme = Column(String)

    deadline = Column(String)

    description = Column(Text, nullable=True)