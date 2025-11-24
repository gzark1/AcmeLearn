"""
SQLAlchemy Base class for all models.

Note: Domain enums have been moved to models/enums.py for better organization.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    Using SQLAlchemy 2.0 DeclarativeBase instead of declarative_base()
    for better type safety and extensibility.
    """
    pass
