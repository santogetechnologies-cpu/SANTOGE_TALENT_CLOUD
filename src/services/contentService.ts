import { supabase } from '../lib/supabase';
import { ContentItem, ContentWorkflowState } from '../types/content';

export const contentService = {
  /**
   * Fetch curriculum content items by workflow state
   */
  async getContentItems(status?: ContentWorkflowState | 'ALL'): Promise<ContentItem[]> {
    try {
      let query = (supabase.from('content_items') as any).select('*');
      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getContentItems error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbContentToDomain(row));
    } catch (err) {
      console.error('getContentItems exception:', err);
      return [];
    }
  },

  async createContentItem(data: {
    title: string;
    type: any;
    trackName: string;
    moduleName?: string;
    authorName: string;
    authorId: string;
  }): Promise<ContentItem | null> {
    const newRecord = {
      title: data.title,
      type: data.type,
      track_name: data.trackName,
      module_name: data.moduleName || 'Core Curriculum',
      status: 'DRAFT',
      author_name: data.authorName,
      author_id: data.authorId,
      content_data: { description: `Standard ${String(data.type).replace('_', ' ')} module for ${data.trackName}.` },
    };

    try {
      const { data: created, error } = await (supabase
        .from('content_items') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbContentToDomain(created);
    } catch (err) {
      console.error('createContentItem error:', err);
      return null;
    }
  },

  async updateWorkflowState(
    itemId: string,
    nextState: ContentWorkflowState,
    reviewerName?: string,
    reviewNotes?: string
  ): Promise<ContentItem | null> {
    try {
      const { data: updated, error } = await (supabase
        .from('content_items') as any)
        .update({
          status: nextState,
          reviewer_name: reviewerName || null,
          review_notes: reviewNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error || !updated) return null;
      return this.mapDbContentToDomain(updated);
    } catch (err) {
      console.error('updateWorkflowState error:', err);
      return null;
    }
  },

  /**
   * Mappers
   */
  mapDbContentToDomain(row: any): ContentItem {
    return {
      id: row.id,
      title: row.title,
      type: row.type || 'LEARNING_CARD',
      trackName: row.track_name,
      moduleName: row.module_name || 'Core Curriculum',
      status: row.status || 'DRAFT',
      authorName: row.author_name,
      authorId: row.author_id || 'usr-content',
      reviewedBy: row.reviewer_name || undefined,
      reviewedAt: row.updated_at ? row.updated_at.split('T')[0] : undefined,
      version: 1,
      tags: ['Engineering', 'Skills'],
      xpPoints: 50,
      estimatedMinutes: 15,
      contentData: typeof row.content_data === 'object' && row.content_data !== null ? row.content_data : {},
      reviewNotes: row.review_notes || undefined,
      updatedAt: row.updated_at ? row.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
    };
  },
};
