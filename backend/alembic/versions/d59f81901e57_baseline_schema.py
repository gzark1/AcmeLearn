"""baseline_schema

Revision ID: d59f81901e57
Revises: 
Create Date: 2025-11-27 21:17:47.033689

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd59f81901e57'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - baseline migration."""
    # Add column comments for JSONB columns
    op.alter_column('recommendations', 'profile_analysis_data',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               comment='ProfileAnalysis JSON from Agent 1',
               existing_nullable=True)
    op.alter_column('recommendations', 'recommendation_details',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               comment='Full recommendation details: courses with scores, learning path',
               existing_nullable=True)
    # Note: Keeping idx_activity_logs_created_at index (useful for queries)


def downgrade() -> None:
    """Downgrade schema - remove column comments."""
    op.alter_column('recommendations', 'recommendation_details',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               comment=None,
               existing_comment='Full recommendation details: courses with scores, learning path',
               existing_nullable=True)
    op.alter_column('recommendations', 'profile_analysis_data',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               comment=None,
               existing_comment='ProfileAnalysis JSON from Agent 1',
               existing_nullable=True)
