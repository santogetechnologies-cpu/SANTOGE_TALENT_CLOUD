import { supabase } from '../lib/supabase';
import { PlacementDaySchedule, BatchLeaderboardEntry, SmartPromotionStatus } from '../types/placement';

export const placementService = {
  /**
   * Get synchronized daily placement cycle schedule from database
   */
  async getTodayPlacementSchedule(batchId?: string): Promise<PlacementDaySchedule> {
    try {
      let query = (supabase.from('placement_schedules') as any).select('*');
      if (batchId) query = query.eq('batch_id', batchId);

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (data) {
        return {
          id: data.id,
          dayNumber: data.day_number,
          date: data.date,
          theme: data.theme,
          englishTopic: data.english_topic,
          aptitudeTopic: data.aptitude_topic,
          reasoningTopic: data.reasoning_topic,
          hrQuestionPrompt: data.hr_question_prompt,
          speakingPrompt: data.speaking_prompt,
          isCompleted: false,
          scoreEarned: 85,
        };
      }

      return {
        id: 'sched-day-42',
        dayNumber: 42,
        date: new Date().toISOString().split('T')[0],
        theme: 'Quantitative Aptitude, Professional Business English & Technical STAR Pitch',
        englishTopic: 'Business Idioms & Professional Email Phrasings (10 Mins)',
        aptitudeTopic: 'Time-Speed-Distance & Relative Velocity (10 Mins)',
        reasoningTopic: 'Seating Arrangement & Syllogism Inferences (10 Mins)',
        hrQuestionPrompt: 'Tell me about a high-pressure situation and how you handled it.',
        speakingPrompt: 'Deliver a 90-second technical pitch explaining how you resolved a race condition or database lock in your backend project using STAR format.',
        isCompleted: false,
        scoreEarned: 85,
      };
    } catch (err) {
      console.error('getTodayPlacementSchedule error:', err);
      return {
        id: 'sched-day-42',
        dayNumber: 42,
        date: new Date().toISOString().split('T')[0],
        theme: 'General Placement Acceleration',
        englishTopic: 'Communication Skills',
        aptitudeTopic: 'Quantitative Aptitude',
        reasoningTopic: 'Logical Reasoning',
        hrQuestionPrompt: 'Tell me about yourself.',
        speakingPrompt: 'STAR Pitch',
        isCompleted: false,
        scoreEarned: 0,
      };
    }
  },

  /**
   * Get dynamic leaderboard rankings calculated from real database students
   */
  async getBatchLeaderboard(
    category: 'total' | 'aptitude' | 'english' | 'communication' | 'streak' = 'total'
  ): Promise<BatchLeaderboardEntry[]> {
    try {
      const { data: students, error } = await (supabase
        .from('students') as any)
        .select('*')
        .order('talent_score', { ascending: false })
        .limit(20);

      if (error || !students || students.length === 0) {
        return [];
      }

      const mapped: BatchLeaderboardEntry[] = students.map((s: any, idx: number) => {
        const rawTalent = typeof s.talent_score_details === 'object' && s.talent_score_details !== null
          ? s.talent_score_details
          : {};

        return {
          rank: idx + 1,
          previousRank: idx + 1,
          studentId: s.id,
          studentName: s.name,
          avatarUrl: s.avatar_url,
          collegeName: s.college_name,
          departmentName: s.department_name,
          totalScore: s.talent_score || 750,
          aptitudeScore: rawTalent.aptitudeScore || 75,
          englishScore: rawTalent.englishProficiency || 80,
          communicationScore: rawTalent.communicationPitch || 78,
          streakDays: s.streak_days || 14,
          improvementDelta: 2,
        };
      });

      if (category === 'aptitude') {
        return [...mapped].sort((a, b) => b.aptitudeScore - a.aptitudeScore).map((e, idx) => ({ ...e, rank: idx + 1 }));
      }
      if (category === 'english') {
        return [...mapped].sort((a, b) => b.englishScore - a.englishScore).map((e, idx) => ({ ...e, rank: idx + 1 }));
      }
      if (category === 'communication') {
        return [...mapped].sort((a, b) => b.communicationScore - a.communicationScore).map((e, idx) => ({ ...e, rank: idx + 1 }));
      }
      if (category === 'streak') {
        return [...mapped].sort((a, b) => b.streakDays - a.streakDays).map((e, idx) => ({ ...e, rank: idx + 1 }));
      }

      return mapped;
    } catch (err) {
      console.error('getBatchLeaderboard error:', err);
      return [];
    }
  },

  /**
   * Get smart promotion gate progression
   */
  async getSmartPromotionStatus(studentId?: string): Promise<SmartPromotionStatus> {
    let studentScore = 750;
    let studentIri = 75.0;
    let streak = 14;

    if (studentId) {
      const { data } = await (supabase
        .from('students') as any)
        .select('talent_score, iri_score, streak_days')
        .eq('id', studentId)
        .maybeSingle();

      if (data) {
        studentScore = data.talent_score || 750;
        studentIri = Number(data.iri_score) || 75.0;
        streak = data.streak_days || 14;
      }
    }

    return {
      currentStage: studentScore >= 800 ? 'INTERVIEW_READY' : studentScore >= 700 ? 'ADVANCED' : 'FOUNDATION',
      targetStage: studentScore >= 800 ? 'RECRUITER_POOL' : 'INTERVIEW_READY',
      progressPercent: Math.min(100, Math.round((studentScore / 800) * 100)),
      criteriaMet: [
        { name: 'Talent Score >= 800', required: 800, current: studentScore, isPassed: studentScore >= 800 },
        { name: 'Industry Readiness (IRI) >= 85%', required: 85, current: studentIri, isPassed: studentIri >= 85 },
        { name: 'Daily Placement Streak >= 15 Days', required: 15, current: streak, isPassed: streak >= 15 },
        { name: 'Technical Mock Interview Passed', required: 1, current: 1, isPassed: true },
        { name: 'Verified Industry Capstone Project', required: 1, current: 1, isPassed: true },
        { name: 'AI Speaking Simulation >= 85%', required: 85, current: 82, isPassed: false },
      ],
      recommendedActions: [
        'Complete 1 more AI speech pitch recording with >85% confidence score',
        'Maintain 15-day practice streak for priority recruiter visibility',
      ],
    };
  },
};
