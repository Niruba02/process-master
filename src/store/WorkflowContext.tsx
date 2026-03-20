import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Workflow,
  Step,
  WorkflowExecution,
  StepExecution,
  ExecutionStatus,
  InputSchema,
} from '@/types/workflow';

interface WorkflowContextType {
  workflows: Workflow[];
  executions: WorkflowExecution[];
  createWorkflow: (name: string, inputSchema: InputSchema) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Omit<Workflow, 'id'>>) => void;
  deleteWorkflow: (id: string) => void;
  getWorkflow: (id: string) => Workflow | undefined;
  addStep: (workflowId: string, step: Omit<Step, 'id'>) => Step;
  updateStep: (workflowId: string, stepId: string, updates: Partial<Step>) => void;
  removeStep: (workflowId: string, stepId: string) => void;
  executeWorkflow: (workflowId: string, inputData: Record<string, unknown>) => string;
  advanceExecution: (executionId: string) => void;
  approveStep: (executionId: string, stepId: string) => void;
  rejectStep: (executionId: string, stepId: string) => void;
  getExecution: (id: string) => WorkflowExecution | undefined;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflows = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflows must be used within WorkflowProvider');
  return ctx;
};

// Demo data
const demoSteps: Step[] = [
  { id: 's1', name: 'Manager Approval', type: 'approval', description: 'Manager reviews expense', next_step_id: 's2', approver: 'manager@company.com' },
  { id: 's2', name: 'Finance Notification', type: 'notification', description: 'Notify finance team', next_step_id: 's3', notification_channel: 'email', notification_message: 'New expense approved by manager' },
  { id: 's3', name: 'CEO Approval', type: 'approval', description: 'CEO reviews high-value expense', next_step_id: 's4', approver: 'ceo@company.com', conditions: [{ field: 'amount', operator: '>', value: 5000, next_step_id: 's4' }] },
  { id: 's4', name: 'Process Payment', type: 'task', description: 'Automatically process the payment', next_step_id: null },
];

const demoWorkflow: Workflow = {
  id: 'demo-1',
  name: 'Expense Approval',
  version: 1,
  is_active: true,
  input_schema: {
    amount: { type: 'number', required: true },
    country: { type: 'string', required: true },
    department: { type: 'string', required: false },
    priority: { type: 'string', required: true, allowed_values: ['High', 'Medium', 'Low'] },
  },
  steps: demoSteps,
  start_step_id: 's1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([demoWorkflow]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  const createWorkflow = useCallback((name: string, inputSchema: InputSchema): Workflow => {
    const wf: Workflow = {
      id: uuidv4(),
      name,
      version: 1,
      is_active: true,
      input_schema: inputSchema,
      steps: [],
      start_step_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setWorkflows(prev => [...prev, wf]);
    return wf;
  }, []);

  const updateWorkflow = useCallback((id: string, updates: Partial<Omit<Workflow, 'id'>>) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w));
  }, []);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  }, []);

  const getWorkflow = useCallback((id: string) => workflows.find(w => w.id === id), [workflows]);

  const addStep = useCallback((workflowId: string, step: Omit<Step, 'id'>): Step => {
    const newStep: Step = { ...step, id: uuidv4() };
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      const steps = [...w.steps];
      // Link last step to new step
      if (steps.length > 0) {
        steps[steps.length - 1] = { ...steps[steps.length - 1], next_step_id: newStep.id };
      }
      steps.push(newStep);
      return {
        ...w,
        steps,
        start_step_id: w.start_step_id || newStep.id,
        updated_at: new Date().toISOString(),
      };
    }));
    return newStep;
  }, []);

  const updateStep = useCallback((workflowId: string, stepId: string, updates: Partial<Step>) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      return { ...w, steps: w.steps.map(s => s.id === stepId ? { ...s, ...updates } : s), updated_at: new Date().toISOString() };
    }));
  }, []);

  const removeStep = useCallback((workflowId: string, stepId: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      const idx = w.steps.findIndex(s => s.id === stepId);
      const steps = w.steps.filter(s => s.id !== stepId);
      // Relink
      if (idx > 0 && steps[idx - 1]) {
        steps[idx - 1] = { ...steps[idx - 1], next_step_id: steps[idx]?.id || null };
      }
      return { ...w, steps, start_step_id: w.start_step_id === stepId ? (steps[0]?.id || null) : w.start_step_id, updated_at: new Date().toISOString() };
    }));
  }, []);

  const executeWorkflow = useCallback((workflowId: string, inputData: Record<string, unknown>): string => {
    const wf = workflows.find(w => w.id === workflowId);
    if (!wf || !wf.start_step_id) throw new Error('Workflow not found or has no steps');

    const firstStep = wf.steps.find(s => s.id === wf.start_step_id)!;
    const stepExecutions: StepExecution[] = wf.steps.map(s => ({
      step_id: s.id,
      step_name: s.name,
      step_type: s.type,
      status: s.id === wf.start_step_id
        ? (s.type === 'approval' ? 'awaiting_approval' : 'running')
        : 'pending',
      started_at: s.id === wf.start_step_id ? new Date().toISOString() : null,
      completed_at: null,
    }));

    const exec: WorkflowExecution = {
      id: uuidv4(),
      workflow_id: workflowId,
      workflow_name: wf.name,
      status: 'running',
      input_data: inputData,
      step_executions: stepExecutions,
      current_step_id: wf.start_step_id,
      started_at: new Date().toISOString(),
      completed_at: null,
    };

    setExecutions(prev => [...prev, exec]);
    
    // Auto-advance non-approval steps
    if (firstStep.type !== 'approval') {
      setTimeout(() => advanceExecution(exec.id), 1500);
    }

    return exec.id;
  }, [workflows]);

  const advanceExecution = useCallback((executionId: string) => {
    setExecutions(prev => prev.map(exec => {
      if (exec.id !== executionId || exec.status !== 'running') return exec;
      const wf = workflows.find(w => w.id === exec.workflow_id);
      if (!wf) return exec;

      const currentStep = wf.steps.find(s => s.id === exec.current_step_id);
      if (!currentStep) return exec;

      // Evaluate conditions
      let nextStepId = currentStep.next_step_id;
      if (currentStep.conditions?.length) {
        for (const cond of currentStep.conditions) {
          const val = exec.input_data[cond.field];
          let match = false;
          if (cond.operator === '==' && val === cond.value) match = true;
          if (cond.operator === '!=' && val !== cond.value) match = true;
          if (cond.operator === '>' && typeof val === 'number' && val > (cond.value as number)) match = true;
          if (cond.operator === '<' && typeof val === 'number' && val < (cond.value as number)) match = true;
          if (cond.operator === '>=' && typeof val === 'number' && val >= (cond.value as number)) match = true;
          if (cond.operator === '<=' && typeof val === 'number' && val <= (cond.value as number)) match = true;
          if (match) { nextStepId = cond.next_step_id; break; }
        }
      }

      const updatedStepExecs = exec.step_executions.map(se => {
        if (se.step_id === currentStep.id) {
          return { ...se, status: 'completed' as const, completed_at: new Date().toISOString(), output: `${currentStep.type} completed successfully` };
        }
        if (nextStepId && se.step_id === nextStepId) {
          const nextStep = wf.steps.find(s => s.id === nextStepId);
          return {
            ...se,
            status: nextStep?.type === 'approval' ? 'awaiting_approval' as const : 'running' as const,
            started_at: new Date().toISOString(),
          };
        }
        return se;
      });

      const newStatus: ExecutionStatus = nextStepId ? 'running' : 'completed';

      const updated = {
        ...exec,
        step_executions: updatedStepExecs,
        current_step_id: nextStepId,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      };

      // Auto-advance non-approval steps
      if (nextStepId) {
        const nextStep = wf.steps.find(s => s.id === nextStepId);
        if (nextStep && nextStep.type !== 'approval') {
          setTimeout(() => advanceExecution(executionId), 1500);
        }
      }

      return updated;
    }));
  }, [workflows]);

  const approveStep = useCallback((executionId: string, stepId: string) => {
    setExecutions(prev => prev.map(exec => {
      if (exec.id !== executionId) return exec;
      const updatedStepExecs = exec.step_executions.map(se =>
        se.step_id === stepId ? { ...se, status: 'completed' as const, completed_at: new Date().toISOString(), output: 'Approved' } : se
      );
      return { ...exec, step_executions: updatedStepExecs };
    }));
    // Then advance
    setTimeout(() => advanceExecution(executionId), 500);
  }, [advanceExecution]);

  const rejectStep = useCallback((executionId: string, stepId: string) => {
    setExecutions(prev => prev.map(exec => {
      if (exec.id !== executionId) return exec;
      const updatedStepExecs = exec.step_executions.map(se =>
        se.step_id === stepId ? { ...se, status: 'failed' as const, completed_at: new Date().toISOString(), output: 'Rejected' } : se
      );
      return { ...exec, step_executions: updatedStepExecs, status: 'failed', completed_at: new Date().toISOString() };
    }));
  }, []);

  const getExecution = useCallback((id: string) => executions.find(e => e.id === id), [executions]);

  return (
    <WorkflowContext.Provider value={{
      workflows, executions, createWorkflow, updateWorkflow, deleteWorkflow, getWorkflow,
      addStep, updateStep, removeStep, executeWorkflow, advanceExecution, approveStep, rejectStep, getExecution,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};
