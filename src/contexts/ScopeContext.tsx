import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { collegeService } from '../services/collegeService';
import { College, Department } from '../types/college';

interface ScopeContextType {
  activeCollege: College | null;
  activeDepartment: Department | null;
  availableColleges: College[];
  availableDepartments: Department[];
  selectCollege: (collegeId: string) => void;
  selectDepartment: (departmentId: string) => void;
}

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [availableColleges, setAvailableColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(
    user?.dataScope.collegeId || null
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(
    user?.dataScope.departmentIds?.[0] || null
  );

  useEffect(() => {
    const load = async () => {
      const colleges = await collegeService.getColleges();
      setAvailableColleges(colleges);
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.dataScope.collegeId) {
      setSelectedCollegeId(user.dataScope.collegeId);
    }
    if (user?.dataScope.departmentIds?.[0]) {
      setSelectedDepartmentId(user.dataScope.departmentIds[0]);
    }
  }, [user]);

  const activeCollege =
    availableColleges.find(c => c.id === (user?.dataScope.collegeId || selectedCollegeId)) ||
    availableColleges[0] ||
    null;

  const availableDepartments = activeCollege?.departments || [];
  const activeDepartment =
    availableDepartments.find(
      d => d.id === (user?.dataScope.departmentIds?.[0] || selectedDepartmentId)
    ) || availableDepartments[0] || null;

  const selectCollege = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    const col = availableColleges.find(c => c.id === collegeId);
    if (col && col.departments.length > 0) {
      setSelectedDepartmentId(col.departments[0].id);
    }
  };

  const selectDepartment = (deptId: string) => {
    setSelectedDepartmentId(deptId);
  };

  return (
    <ScopeContext.Provider
      value={{
        activeCollege,
        activeDepartment,
        availableColleges,
        availableDepartments,
        selectCollege,
        selectDepartment,
      }}
    >
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = (): ScopeContextType => {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error('useScope must be used within a ScopeProvider');
  }
  return context;
};
