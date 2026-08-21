import { supabase } from '../lib/supabase';
import { College, Department, CampusDrive, CompanyCRMRecord, MarketSkillTrend } from '../types/college';
import { DataScope } from '../types/auth';

export const collegeService = {
  /**
   * Fetch all colleges
   */
  async getColleges(): Promise<College[]> {
    try {
      const { data, error } = await (supabase
        .from('colleges') as any)
        .select('*, departments(*)')
        .order('name', { ascending: true });

      if (error) {
        console.error('getColleges error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbCollegeToDomain(row));
    } catch (err) {
      console.error('getColleges exception:', err);
      return [];
    }
  },

  /**
   * Get single college by ID
   */
  async getCollegeById(id: string): Promise<College | null> {
    try {
      const { data, error } = await (supabase
        .from('colleges') as any)
        .select('*, departments(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('getCollegeById error:', error);
        return null;
      }

      if (!data) return null;

      return this.mapDbCollegeToDomain(data);
    } catch (err) {
      console.error('getCollegeById exception:', err);
      return null;
    }
  },

  /**
   * Create new college institution
   */
  async createCollege(data: {
    name: string;
    code: string;
    city: string;
    state: string;
    adminName: string;
    adminEmail: string;
    placementOfficerName?: string;
    placementOfficerEmail?: string;
  }): Promise<College | null> {
    const newRecord = {
      name: data.name,
      code: data.code,
      city: data.city,
      state: data.state,
      total_students: 0,
      placed_count: 0,
      placement_percentage: 0,
      average_package_lpa: 0,
      highest_package_lpa: 0,
      companies_visited_count: 0,
      offers_generated_count: 0,
      admin_name: data.adminName,
      admin_email: data.adminEmail,
      placement_officer_name: data.placementOfficerName || data.adminName,
      placement_officer_email: data.placementOfficerEmail || data.adminEmail,
      subscription_status: 'ENTERPRISE_ACTIVE',
    };

    try {
      const { data: created, error } = await (supabase
        .from('colleges') as any)
        .insert(newRecord)
        .select('*, departments(*)')
        .single();

      if (error || !created) {
        console.error('createCollege error:', error);
        return null;
      }

      return this.mapDbCollegeToDomain(created);
    } catch (err) {
      console.error('createCollege exception:', err);
      return null;
    }
  },

  /**
   * Update college statistics & profile
   */
  async updateCollege(id: string, updates: Partial<College>): Promise<boolean> {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.city) dbUpdates.city = updates.city;
      if (updates.state) dbUpdates.state = updates.state;
      if (updates.adminName) dbUpdates.admin_name = updates.adminName;
      if (updates.placementOfficerName) dbUpdates.placement_officer_name = updates.placementOfficerName;
      if (updates.subscriptionStatus) dbUpdates.subscription_status = updates.subscriptionStatus;

      const { error } = await (supabase.from('colleges') as any).update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      console.error('updateCollege error:', err);
      return false;
    }
  },

  /**
   * Delete college institution in real-time from Supabase
   */
  async deleteCollege(id: string): Promise<boolean> {
    try {
      // 1. Delete linked departments first if cascade is needed
      try {
        await (supabase.from('departments') as any).delete().eq('college_id', id);
      } catch (e) {
        // continue
      }

      // 2. Delete college record
      const { error } = await (supabase.from('colleges') as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('deleteCollege error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('deleteCollege exception:', err);
      return false;
    }
  },

  /**
   * Departments
   */
  async getDepartments(collegeId: string): Promise<Department[]> {
    try {
      const { data, error } = await (supabase
        .from('departments') as any)
        .select('*')
        .eq('college_id', collegeId)
        .order('name', { ascending: true });

      if (error || !data) return [];
      return data.map((row: any) => this.mapDbDepartmentToDomain(row));
    } catch (err) {
      console.error('getDepartments error:', err);
      return [];
    }
  },

  async createDepartment(data: {
    collegeId: string;
    name: string;
    code: string;
    coordinatorName: string;
    coordinatorEmail: string;
  }): Promise<Department | null> {
    try {
      const { data: created, error } = await (supabase
        .from('departments') as any)
        .insert({
          college_id: data.collegeId,
          name: data.name,
          code: data.code,
          coordinator_name: data.coordinatorName,
          coordinator_email: data.coordinatorEmail,
          total_students: 0,
          placed_count: 0,
          placement_rate: 0,
          average_talent_score: 0,
        })
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbDepartmentToDomain(created);
    } catch (err) {
      console.error('createDepartment error:', err);
      return null;
    }
  },

  async updateDepartment(
    id: string,
    data: {
      name: string;
      code: string;
      coordinatorName: string;
      coordinatorEmail: string;
    }
  ): Promise<Department | null> {
    try {
      const { data: updated, error } = await (supabase
        .from('departments') as any)
        .update({
          name: data.name,
          code: data.code,
          coordinator_name: data.coordinatorName,
          coordinator_email: data.coordinatorEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !updated) return null;
      return this.mapDbDepartmentToDomain(updated);
    } catch (err) {
      console.error('updateDepartment error:', err);
      return null;
    }
  },

  /**
   * Campus Drives CRUD
   */
  async getCampusDrives(collegeIdOrScope?: string | DataScope, filterStatus?: string): Promise<CampusDrive[]> {
    try {
      let query = (supabase.from('campus_drives') as any).select('*');
      
      const collegeId = typeof collegeIdOrScope === 'string'
        ? collegeIdOrScope
        : collegeIdOrScope?.collegeId;

      if (collegeId) query = query.eq('college_id', collegeId);
      if (filterStatus && filterStatus !== 'ALL') query = query.eq('status', filterStatus);

      const { data, error } = await query.order('drive_date', { ascending: false });

      if (error) {
        console.error('getCampusDrives error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbDriveToDomain(row));
    } catch (err) {
      console.error('getCampusDrives error:', err);
      return [];
    }
  },

  async getCampusDriveById(driveId: string): Promise<CampusDrive | null> {
    try {
      const { data, error } = await (supabase
        .from('campus_drives') as any)
        .select('*')
        .eq('id', driveId)
        .maybeSingle();

      if (error || !data) return null;
      return this.mapDbDriveToDomain(data);
    } catch (err) {
      console.error('getCampusDriveById error:', err);
      return null;
    }
  },

  async createCampusDrive(data: {
    collegeId: string;
    companyName: string;
    roleTitle: string;
    ctcLPA: number;
    location?: string;
    driveDate: string;
    registrationDeadline?: string;
    eligibility: any;
  }): Promise<CampusDrive | null> {
    const newDrive = {
      college_id: data.collegeId,
      company_name: data.companyName,
      role_title: data.roleTitle,
      ctc_lpa: data.ctcLPA,
      location: data.location || 'Bengaluru / Hybrid',
      drive_date: data.driveDate,
      registration_deadline: data.registrationDeadline || data.driveDate,
      eligibility: data.eligibility,
      status: 'REGISTRATION_OPEN',
      stats: { registeredCount: 0, shortlistedCount: 0, interviewedCount: 0, selectedCount: 0, offersReleasedCount: 0 },
      rounds: [
        { name: 'Online Assessment', type: 'ONLINE_TEST', date: data.driveDate, completed: false },
        { name: 'Technical Interview', type: 'TECHNICAL_INTERVIEW', date: data.driveDate, completed: false },
        { name: 'HR Interview', type: 'HR_INTERVIEW', date: data.driveDate, completed: false },
      ],
    };

    try {
      const { data: created, error } = await (supabase
        .from('campus_drives') as any)
        .insert(newDrive)
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbDriveToDomain(created);
    } catch (err) {
      console.error('createCampusDrive error:', err);
      return null;
    }
  },

  async updateCampusDriveStatus(driveId: string, status: CampusDrive['status']): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('campus_drives') as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', driveId);

      return !error;
    } catch (err) {
      console.error('updateCampusDriveStatus error:', err);
      return false;
    }
  },

  async updateDriveStatus(driveId: string, status: CampusDrive['status']): Promise<boolean> {
    return this.updateCampusDriveStatus(driveId, status);
  },

  /**
   * Company CRM
   */
  async getCompanyCRM(collegeIdOrScope?: string | DataScope): Promise<CompanyCRMRecord[]> {
    try {
      let query = (supabase.from('company_crm') as any).select('*');
      const collegeId = typeof collegeIdOrScope === 'string'
        ? collegeIdOrScope
        : collegeIdOrScope?.collegeId;

      if (collegeId) query = query.eq('college_id', collegeId);

      const { data, error } = await query.order('name', { ascending: true });

      if (error || !data) return [];
      return data.map((row: any) => this.mapDbCRMToDomain(row));
    } catch (err) {
      console.error('getCompanyCRM error:', err);
      return [];
    }
  },

  async getCRMRecords(collegeIdOrScope?: string | DataScope): Promise<CompanyCRMRecord[]> {
    return this.getCompanyCRM(collegeIdOrScope);
  },

  async logCRMInteraction(
    companyId: string,
    officerName: string,
    channel: 'Email' | 'Phone' | 'Meeting' | 'Campus Visit',
    summary: string
  ): Promise<CompanyCRMRecord | null> {
    try {
      const { data: company, error: fetchErr } = await (supabase
        .from('company_crm') as any)
        .select('*')
        .eq('id', companyId)
        .single();

      if (fetchErr || !company) return null;

      const currentLogs = Array.isArray(company.interaction_logs) ? company.interaction_logs : [];
      const newLog = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        officerName,
        channel,
        summary,
      };

      const updatedLogs = [newLog, ...currentLogs];

      const { data: updated, error: updateErr } = await (supabase
        .from('company_crm') as any)
        .update({ interaction_logs: updatedLogs, updated_at: new Date().toISOString() })
        .eq('id', companyId)
        .select()
        .single();

      if (updateErr || !updated) return null;
      return this.mapDbCRMToDomain(updated);
    } catch (err) {
      console.error('logCRMInteraction error:', err);
      return null;
    }
  },

  /**
   * Market Skill Trends
   */
  async getMarketTrends(): Promise<MarketSkillTrend[]> {
    return [
      { skillName: 'FastAPI & Async Microservices', demandGrowthPercent: 38, averageSalaryLPA: 14.5, topHiringSectors: ['FinTech', 'SaaS', 'E-Commerce'], openingsCount: 420, relevanceScore: 94 },
      { skillName: 'Distributed PostgreSQL & Sharding', demandGrowthPercent: 29, averageSalaryLPA: 16.0, topHiringSectors: ['Cloud Systems', 'FinTech'], openingsCount: 310, relevanceScore: 91 },
      { skillName: 'PyTorch & LLM Fine-Tuning', demandGrowthPercent: 64, averageSalaryLPA: 18.5, topHiringSectors: ['AI Labs', 'HealthTech', 'Automotive'], openingsCount: 520, relevanceScore: 96 },
      { skillName: 'AWS Terraform IaC & Kubernetes', demandGrowthPercent: 22, averageSalaryLPA: 13.5, topHiringSectors: ['Enterprise IT', 'Cloud infra'], openingsCount: 480, relevanceScore: 89 },
      { skillName: 'React 18 & Full Stack TypeScript', demandGrowthPercent: 18, averageSalaryLPA: 12.0, topHiringSectors: ['Consumer Apps', 'Product Tech'], openingsCount: 650, relevanceScore: 92 },
    ];
  },

  /**
   * Mappers
   */
  mapDbCollegeToDomain(row: any): College {
    const rawDepts = Array.isArray(row.departments) ? row.departments : [];
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      city: row.city,
      state: row.state,
      logoUrl: row.logo_url || 'https://images.unsplash.com/photo-1562774053-701939374585?w=150',
      totalStudents: row.total_students || 0,
      placedCount: row.placed_count || 0,
      placementPercentage: Number(row.placement_percentage) || 0,
      averagePackageLPA: Number(row.average_package_lpa) || 0,
      highestPackageLPA: Number(row.highest_package_lpa) || 0,
      companiesVisitedCount: row.companies_visited_count || 0,
      offersGeneratedCount: row.offers_generated_count || 0,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      placementOfficerName: row.placement_officer_name,
      placementOfficerEmail: row.placement_officer_email,
      subscriptionStatus: (row.subscription_status as any) || 'ACTIVE',
      createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      departments: rawDepts.map((d: any) => collegeService.mapDbDepartmentToDomain(d)),
    };
  },

  mapDbDepartmentToDomain(row: any): Department {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      coordinatorId: row.coordinator_id || 'usr-dept',
      coordinatorName: row.coordinator_name,
      coordinatorEmail: row.coordinator_email,
      totalStudents: row.total_students || 0,
      placedStudents: row.placed_count || 0,
      placementRate: Number(row.placement_rate) || 0,
      averageTalentScore: row.average_talent_score || 0,
      averagePackageLPA: 7.8,
    };
  },

  mapDbDriveToDomain(row: any): CampusDrive {
    return {
      id: row.id,
      collegeId: row.college_id,
      companyName: row.company_name,
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      roleTitle: row.role_title,
      jobType: 'Full-time',
      ctcLPA: Number(row.ctc_lpa) || 0,
      location: row.location || 'Bengaluru',
      driveDate: row.drive_date,
      registrationDeadline: row.registration_deadline || row.drive_date,
      eligibility: typeof row.eligibility === 'object' && row.eligibility !== null ? row.eligibility : {
        minTalentScore: 700,
        minIRI: 70,
        minCgpa: 7.0,
        allowedDepartments: ['CSE', 'AIDS', 'ECE'],
        maxBacklogs: 0,
      },
      status: (row.status as any) || 'REGISTRATION_OPEN',
      stats: typeof row.stats === 'object' && row.stats !== null ? row.stats : {
        registeredCount: 0,
        shortlistedCount: 0,
        interviewedCount: 0,
        selectedCount: 0,
        offersReleasedCount: 0,
      },
      rounds: Array.isArray(row.rounds) && row.rounds.length > 0 ? row.rounds : [
        { name: 'Online Assessment', type: 'ONLINE_TEST', date: row.drive_date, completed: false },
        { name: 'Technical Interview', type: 'TECHNICAL_INTERVIEW', date: row.drive_date, completed: false },
        { name: 'HR Interview', type: 'HR_INTERVIEW', date: row.drive_date, completed: false },
      ],
    };
  },

  mapDbCRMToDomain(row: any): CompanyCRMRecord {
    return {
      id: row.id,
      collegeId: row.college_id,
      name: row.name,
      industry: row.industry,
      tier: (row.tier?.includes('1') ? 'Tier 1' : row.tier?.includes('2') ? 'Tier 2' : 'Tier 3') as any,
      contactPerson: row.contact_person,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      lastVisitedYear: 2026,
      relationshipStatus: (row.relationship_status as any) || 'ACTIVE_PARTNER',
      averageCtcLPA: Number(row.average_ctc_lpa) || 0,
      averageOffers: row.average_offers || 0,
      targetDepartments: ['Computer Science & Engineering', 'AI & Data Science'],
      notes: Array.isArray(row.notes) ? row.notes : [],
      interactionLogs: Array.isArray(row.interaction_logs) ? row.interaction_logs : [],
      followUpDate: row.follow_up_date || undefined,
    };
  },
};
