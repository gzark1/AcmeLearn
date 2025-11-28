"""add_llm_metrics

Revision ID: a1b2c3d4e5f6
Revises: d59f81901e57
Create Date: 2025-11-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd59f81901e57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create llm_metrics table for LLM observability."""
    op.create_table(
        'llm_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('recommendation_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('operation', sa.String(50), nullable=False, comment='profile_analysis or course_recommendation'),
        sa.Column('model', sa.String(50), nullable=True, comment='LLM model used'),
        sa.Column('duration_ms', sa.Integer(), nullable=False, comment='Request duration in milliseconds'),
        sa.Column('tokens_input', sa.Integer(), nullable=True, comment='Input/prompt tokens'),
        sa.Column('tokens_output', sa.Integer(), nullable=True, comment='Output/completion tokens'),
        sa.Column('tokens_total', sa.Integer(), nullable=True, comment='Total tokens used'),
        sa.Column('status', sa.String(20), nullable=False, server_default='success', comment='success or error'),
        sa.Column('error', sa.Text(), nullable=True, comment='Error message if failed'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for common queries
    op.create_index('idx_llm_metrics_created_at', 'llm_metrics', ['created_at'], postgresql_using='btree')
    op.create_index('idx_llm_metrics_user_id', 'llm_metrics', ['user_id'], postgresql_using='btree')
    op.create_index('idx_llm_metrics_operation', 'llm_metrics', ['operation'], postgresql_using='btree')


def downgrade() -> None:
    """Drop llm_metrics table."""
    op.drop_index('idx_llm_metrics_operation', table_name='llm_metrics')
    op.drop_index('idx_llm_metrics_user_id', table_name='llm_metrics')
    op.drop_index('idx_llm_metrics_created_at', table_name='llm_metrics')
    op.drop_table('llm_metrics')
