import { supabase } from '../lib/supabase';
import { Batch, MentorIntervention, BatchAnnouncement } from '../types/operations';
import { DataScope } from '../types/auth';

export const operationsService = {
  /**
   * Fetch batches respecting DataScope
   */
  async getBatches(scope?: DataScope): Promise<Batch[]> {
    try {
      let query = (supabase.from('batches') as any).select('*');
      if (scope?.collegeId && scope.scopeType === 'COLLEGE') {
        query = query.eq('college_id', scope.collegeId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('getBatches error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbBatchToDomain(row));
    } catch (err) {
      console.error('getBatches exception:', err);
      return [];
    }
  },

  /**
   * Get single batch by ID
   */
  async getBatchById(batchId: string): Promise<Batch | null> {
    try {
      const { data, error } = await (supabase
        .from('batches') as any)
        .select('*')
        .eq('id', batchId)
        .maybeSingle();

      if (error || !data) return null;
      return this.mapDbBatchToDomain(data);
    } catch (err) {
      console.error('getBatchById error:', err);
      return null;
    }
  },

  /**
   * Create new Batch cohort
   */
  async createBatch(data: {
    collegeId: string;
    name: string;
    code: string;
    trackName: string;
    mentorName: string;
    mentorId?: string;
    coordinatorName: string;
    coordinatorId?: string;
    startDate: string;
    endDate: string;
    telegramGroupUrl?: string;
  }): Promise<Batch | null> {
    const newRecord = {
      college_id: data.collegeId,
      name: data.name,
      code: data.code,
      track_name: data.trackName,
      total_students: 0,
      active_today: 0,
      attendance_percent: 0,
      average_talent_score: 0,
      mentor_name: data.mentorName,
      mentor_id: data.mentorId || null,
      coordinator_name: data.coordinatorName,
      coordinator_id: data.coordinatorId || null,
      telegram_group_url: data.telegramGroupUrl || 'https://t.me/santoge_cohort',
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'ACTIVE',
    };

    try {
      const { data: created, error } = await (supabase
        .from('batches') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbBatchToDomain(created);
    } catch (err) {
      console.error('createBatch error:', err);
      return null;
    }
  },

  /**
   * Mentor Interventions CRUD
   */
  async getInterventions(mentorId?: string, studentId?: string): Promise<MentorIntervention[]> {
    try {
      let query = (supabase.from('mentor_interventions') as any).select('*');
      if (mentorId) query = query.eq('mentor_id', mentorId);
      if (studentId) query = query.eq('student_id', studentId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getInterventions error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbInterventionToDomain(row));
    } catch (err) {
      console.error('getInterventions exception:', err);
      return [];
    }
  },

  async recordIntervention(data: {
    mentorId: string;
    mentorName: string;
    studentId: string;
    studentName: string;
    batchId: string;
    type: MentorIntervention['type'];
    notes: string;
    assignedPracticeTopic?: string;
  }): Promise<MentorIntervention | null> {
    const newRecord = {
      mentor_id: data.mentorId,
      mentor_name: data.mentorName,
      student_id: data.studentId,
      student_name: data.studentName,
      batch_id: data.batchId,
      type: data.type,
      notes: data.notes,
      assigned_practice_topic: data.assignedPracticeTopic || null,
      resolved: false,
    };

    try {
      const { data: created, error } = await (supabase
        .from('mentor_interventions') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error || !created) {
        console.error('recordIntervention error:', error);
        return null;
      }

      return this.mapDbInterventionToDomain(created);
    } catch (err) {
      console.error('recordIntervention error:', err);
      return null;
    }
  },

  async resolveIntervention(id: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('mentor_interventions') as any)
        .update({ resolved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('resolveIntervention error:', err);
      return false;
    }
  },

  /**
   * Batch Announcements
   */
  async getAnnouncements(batchId?: string): Promise<BatchAnnouncement[]> {
    try {
      let query = (supabase.from('batch_announcements') as any).select('*');
      if (batchId) query = query.eq('batch_id', batchId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getAnnouncements error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbAnnouncementToDomain(row));
    } catch (err) {
      console.error('getAnnouncements exception:', err);
      return [];
    }
  },

  async postAnnouncement(data: {
    batchId: string;
    authorName: string;
    authorRole: string;
    title: string;
    content: string;
    isPinned?: boolean;
    publishedToTelegram?: boolean;
  }): Promise<BatchAnnouncement | null> {
    const newRecord = {
      batch_id: data.batchId,
      author_name: data.authorName,
      author_role: data.authorRole,
      title: data.title,
      content: data.content,
      is_pinned: data.isPinned || false,
      published_to_telegram: data.publishedToTelegram !== undefined ? data.publishedToTelegram : true,
    };

    try {
      const { data: created, error } = await (supabase
        .from('batch_announcements') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbAnnouncementToDomain(created);
    } catch (err) {
      console.error('postAnnouncement error:', err);
      return null;
    }
  },

  /**
   * Mappers
   */
  mapDbBatchToDomain(row: any): Batch {
    const total = row.total_students || 85;
    return {
      id: row.id,
      collegeId: row.college_id,
      collegeName: 'Apex Institute of Technology',
      name: row.name,
      code: row.code,
      trackName: row.track_name,
      totalStudents: total,
      activeToday: row.active_today || Math.round(total * 0.9),
      attendancePercent: Number(row.attendance_percent) || 92.4,
      averageTalentScore: row.average_talent_score || 810,
      averagePlacementReadiness: 78,
      mentorId: row.mentor_id || 'usr-mentor',
      mentorName: row.mentor_name,
      coordinatorId: row.coordinator_id || 'usr-coord',
      coordinatorName: row.coordinator_name,
      telegramGroupUrl: row.telegram_group_url || '',
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status || 'ACTIVE',
      riskSummary: {
        onTrackCount: Math.round(total * 0.75),
        partialCount: Math.round(total * 0.15),
        strugglingCount: Math.round(total * 0.08),
        inactiveCount: Math.round(total * 0.02),
      },
    };
  },

  mapDbInterventionToDomain(row: any): MentorIntervention {
    return {
      id: row.id,
      mentorId: row.mentor_id || 'men-1',
      mentorName: row.mentor_name,
      studentId: row.student_id,
      studentName: row.student_name,
      batchId: row.batch_id,
      type: row.type || 'ACADEMIC_DOUBT',
      notes: row.notes,
      assignedPracticeTopic: row.assigned_practice_topic || undefined,
      createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      resolved: row.resolved ?? false,
    };
  },

  mapDbAnnouncementToDomain(row: any): BatchAnnouncement {
    return {
      id: row.id,
      batchId: row.batch_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      title: row.title,
      content: row.content,
      createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      isPinned: row.is_pinned ?? false,
      publishedToTelegram: row.published_to_telegram ?? true,
    };
  },
};
