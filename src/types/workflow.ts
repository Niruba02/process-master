export type StepType = 'task' | 'approval' | 'notification';

export type FieldType = 'string' | 'number' | 'boolean';

export interface InputFieldSchema {
  type: FieldType;
  required: boolean;
  allowed_values?: string[];
}

export interface InputSchema {
  [fieldName: string]: InputFieldSchema;
}

export interface Step {
  id: string;
  name: string;
  type: StepType;
  description: string;
  next_step_id: string | null;
  /** For conditional branching */
  conditions?: StepCondition[];
  /** For approval steps */
  approver?: string;
  /** For notification steps */
  notification_channel?: 'email' | 'slack' | 'ui';
  notification_message?: string;
}

export interface StepCondition {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
  next_step_id: string;
}

export interface Workflow {
  id: string;
  name: string;
  version: number;
  is_active: boolean;
  input_schema: InputSchema;
  steps: Step[];
  start_step_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'paused';
export type StepExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'awaiting_approval';

export interface StepExecution {
  step_id: string;
  step_name: string;
  step_type: StepType;
  status: StepExecutionStatus;
  started_at: string | null;
  completed_at: string | null;
  output?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: ExecutionStatus;
  input_data: Record<string, unknown>;
  step_executions: StepExecution[];
  current_step_id: string | null;
  started_at: string;
  completed_at: string | null;
}
