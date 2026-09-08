-- ============================================================================
-- Migration: 004_content_schema.sql
-- Description: Content CMS items (English videos, Aptitude videos, Guided practice, Lab briefs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('English video', 'Aptitude video', 'Guided practice', 'Lab brief')),
    track TEXT NOT NULL DEFAULT 'All tracks',
    duration TEXT NOT NULL DEFAULT '10m',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
