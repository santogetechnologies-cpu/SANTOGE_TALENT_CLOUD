import { supabase } from '../lib/supabase';
import { CareerTrack, DailyMission } from '../types/student';
import { ProjectItem, KnowledgeGraphNode, WeeklyHackMission } from '../types/learning';

export const learningService = {
  /**
   * Get student daily mission
   */
  async getDailyMission(trackId: string = 'track-python'): Promise<DailyMission> {
    try {
      const { data, error } = await (supabase
        .from('daily_missions') as any)
        .select('*')
        .eq('track_id', trackId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const rawTasks = Array.isArray(data.tasks) ? data.tasks : [];
        return {
          id: data.id,
          date: data.date,
          dayNumber: data.day_number,
          trackId: data.track_id || trackId,
          trackName: data.track_name,
          theme: data.theme,
          tasks: rawTasks,
          isCompleted: false,
          totalXpEarned: rawTasks.filter((t: any) => t.status === 'COMPLETED').reduce((acc: number, c: any) => acc + (c.xpReward || 0), 0),
        };
      }

      // Default structured mission schema if none created yet
      return {
        id: 'mission-today',
        date: new Date().toISOString().split('T')[0],
        dayNumber: 42,
        trackId,
        trackName: 'Python Backend & Microservices',
        theme: 'FastAPI Concurrency, Async Sessions & Query Optimization',
        tasks: [
          {
            id: 'task-1',
            title: '5-Min Micro Card: Concurrency & Async Event Loops in Python 3.11',
            type: 'LEARNING_CARD',
            durationMinutes: 5,
            xpReward: 25,
            difficulty: 'Easy',
            skillName: 'Python 3.11',
            status: 'AVAILABLE',
          },
          {
            id: 'task-2',
            title: 'Simulated Lab: Async FastAPI Router with Pydantic Validation',
            type: 'INTERACTIVE_LAB',
            durationMinutes: 15,
            xpReward: 50,
            difficulty: 'Medium',
            skillName: 'FastAPI',
            status: 'AVAILABLE',
          },
          {
            id: 'task-3',
            title: 'Live Incident: Fix Shared Balance Race Condition Under 5,000 req/s',
            type: 'DEBUG_CHALLENGE',
            durationMinutes: 15,
            xpReward: 50,
            difficulty: 'Hard',
            skillName: 'PostgreSQL Locking',
            status: 'AVAILABLE',
          },
          {
            id: 'task-4',
            title: 'Daily 40-Min Placement Cycle: English Grammar & Quantitative Aptitude',
            type: 'ASSIGNMENT',
            durationMinutes: 20,
            xpReward: 50,
            difficulty: 'Medium',
            skillName: 'Placement Aptitude',
            status: 'AVAILABLE',
          },
        ],
        isCompleted: false,
        totalXpEarned: 0,
      };
    } catch (err) {
      console.error('getDailyMission exception:', err);
      return {
        id: 'mission-today',
        date: new Date().toISOString().split('T')[0],
        dayNumber: 42,
        trackId,
        trackName: 'Technical Career Track',
        theme: 'Engineering Foundations & Microservices',
        tasks: [],
        isCompleted: false,
        totalXpEarned: 0,
      };
    }
  },

  /**
   * Mark a daily mission task as complete using atomic transaction procedure
   */
  async completeDailyTask(taskId: string, studentId?: string, xpEarned: number = 50): Promise<DailyMission> {
    try {
      if (studentId) {
        await (supabase.rpc as any)('complete_mission_task', {
          p_task_id: taskId,
          p_student_id: studentId,
          p_mission_id: '00000000-0000-0000-0000-000000000000',
          p_xp: xpEarned,
        });
      }
    } catch (err) {
      console.error('completeDailyTask RPC error:', err);
    }

    const mission = await this.getDailyMission();
    const updatedTasks = mission.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'COMPLETED' as const, completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : t
    );
    const allDone = updatedTasks.every(t => t.status === 'COMPLETED');
    const xpTotal = updatedTasks.filter(t => t.status === 'COMPLETED').reduce((acc, curr) => acc + curr.xpReward, 0);

    return {
      ...mission,
      tasks: updatedTasks,
      isCompleted: allDone,
      totalXpEarned: xpTotal,
    };
  },

  /**
   * Fetch all 15+ Career Tracks
   */
  async getCareerTracks(): Promise<CareerTrack[]> {
    try {
      const { data, error } = await supabase
        .from('career_tracks')
        .select('*')
        .order('title', { ascending: true });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => this.mapDbTrackToDomain(row));
    } catch (err) {
      console.error('getCareerTracks error:', err);
      return [];
    }
  },

  /**
   * Projects CRUD
   */
  async getProjects(trackId?: string): Promise<ProjectItem[]> {
    try {
      let query = supabase.from('projects').select('*');
      if (trackId) query = query.eq('track_id', trackId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((row: any) => this.mapDbProjectToDomain(row));
    } catch (err) {
      console.error('getProjects error:', err);
      return [];
    }
  },

  async submitProject(data: {
    studentId?: string;
    title: string;
    type: ProjectItem['type'];
    trackId: string;
    description: string;
    githubRepo: string;
    skillsGained: string[];
  }): Promise<ProjectItem | null> {
    const newRecord = {
      student_id: data.studentId || null,
      title: data.title,
      type: data.type,
      track_id: data.trackId,
      difficulty: 'Intermediate',
      description: data.description,
      skills_gained: data.skillsGained,
      github_repo: data.githubRepo,
      status: 'SUBMITTED' as const,
    };

    try {
      const { data: created, error } = await (supabase
        .from('projects') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbProjectToDomain(created);
    } catch (err) {
      console.error('submitProject error:', err);
      return null;
    }
  },

  /**
   * Hack Missions
   */
  async getHackMissions(): Promise<WeeklyHackMission[]> {
    try {
      const { data, error } = await (supabase.from('hack_missions') as any).select('*');
      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        sponsorCompany: row.sponsor_company,
        industryProblem: row.industry_problem,
        deadlineHoursRemaining: row.deadline_hours_remaining,
        prizeXP: row.prize_xp,
        status: row.status as any,
        participantsCount: row.participants_count,
        submissionsCount: Math.round((row.participants_count || 0) * 0.4),
      }));
    } catch (err) {
      console.error('getHackMissions error:', err);
      return [];
    }
  },

  async getWeeklyHackMission(): Promise<WeeklyHackMission | null> {
    const list = await this.getHackMissions();
    return list[0] || null;
  },

  /**
   * Knowledge Graph Nodes & Visualizer
   */
  async getKnowledgeGraph(trackId: string = 'track-python'): Promise<KnowledgeGraphNode[]> {
    return [
      { id: 'node-py-core', label: 'Python 3.11 Async / Event Loop', category: 'Foundation', status: 'MASTERED', xpPoints: 100, dependencies: [], description: 'Core Python concurrency engine' },
      { id: 'node-fastapi', label: 'FastAPI Dependency Injection & Routers', category: 'Framework', status: 'MASTERED', xpPoints: 150, dependencies: ['node-py-core'], description: 'FastAPI web application structure' },
      { id: 'node-pydantic', label: 'Pydantic V2 Schemas & Data Serialization', category: 'Framework', status: 'MASTERED', xpPoints: 120, dependencies: ['node-fastapi'], description: 'Data schemas and validations' },
      { id: 'node-postgres', label: 'PostgreSQL Relational Schema & Indexes', category: 'Database', status: 'IN_PROGRESS', xpPoints: 180, dependencies: ['node-pydantic'], description: 'Relational data modeling and indexing' },
      { id: 'node-redis', label: 'Redis In-Memory Caching & Rate Limiting', category: 'Database', status: 'LOCKED', xpPoints: 140, dependencies: ['node-postgres'], description: 'Key-value caching layer' },
      { id: 'node-docker', label: 'Multi-Stage Docker & Compose Orchestration', category: 'DevOps', status: 'LOCKED', xpPoints: 160, dependencies: ['node-postgres'], description: 'Container packaging and microservices' },
      { id: 'node-security', label: 'OAuth2 JWT & API Security Policies', category: 'Security', status: 'LOCKED', xpPoints: 200, dependencies: ['node-redis'], description: 'Enterprise authentication boundary' },
    ];
  },

  /**
   * Mappers
   */
  mapDbTrackToDomain(row: any): CareerTrack {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      icon: row.icon,
      totalModules: row.total_modules || 12,
      completedModules: 4,
      progressPercent: 33,
      level: 3,
      skillsCovered: Array.isArray(row.skills_covered) ? row.skills_covered : [],
      specializations: Array.isArray(row.specializations) ? row.specializations : [],
      isEnrolled: true,
    };
  },

  mapDbProjectToDomain(row: any): ProjectItem {
    return {
      id: row.id,
      title: row.title,
      type: row.type || 'INDUSTRY_PROJECT',
      trackName: 'Python Backend & Microservices',
      difficulty: row.difficulty || 'Intermediate',
      description: row.description,
      skillsGained: Array.isArray(row.skills_gained) ? row.skills_gained : [],
      estimatedHours: 24,
      githubRepo: row.github_repo || undefined,
      status: row.status || 'SUBMITTED',
      score: row.score || undefined,
      reviewerNotes: row.reviewer_notes || undefined,
    };
  },
};
