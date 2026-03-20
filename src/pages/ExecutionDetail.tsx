import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import AppLayout from '@/components/AppLayout';
import StepNode from '@/components/StepNode';
import { ArrowLeft, CheckCircle2, Loader2, XCircle, Pause } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  running: { icon: <Loader2 className="w-4 h-4 animate-spin" />, label: 'Running', color: 'text-info' },
  completed: { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed', color: 'text-success' },
  failed: { icon: <XCircle className="w-4 h-4" />, label: 'Failed', color: 'text-destructive' },
  paused: { icon: <Pause className="w-4 h-4" />, label: 'Paused', color: 'text-warning' },
};

const ExecutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getExecution, getWorkflow, approveStep, rejectStep } = useWorkflows();
  const execution = getExecution(id!);

  if (!execution) return (
    <AppLayout><div className="container py-16 text-center text-muted-foreground">Execution not found.</div></AppLayout>
  );

  const workflow = getWorkflow(execution.workflow_id);
  const status = statusConfig[execution.status];

  return (
    <AppLayout>
      <div className="container py-8 max-w-3xl">
        <Link to="/executions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Executions
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{execution.workflow_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
              {status.icon} {status.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{execution.id.slice(0, 8)}</span>
          </div>
        </motion.div>

        {/* Input Data */}
        <div className="mb-8 p-4 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-2">Input Data</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(execution.input_data).map(([key, val]) => (
              <div key={key} className="px-3 py-2 rounded-md bg-surface-sunken text-xs">
                <span className="font-mono text-muted-foreground">{key}:</span>{' '}
                <span className="text-foreground font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Executions */}
        <h3 className="text-sm font-medium text-foreground mb-4">Step Progress</h3>
        <div>
          {execution.step_executions.map((se, idx) => {
            const step = workflow?.steps.find(s => s.id === se.step_id);
            if (!step) return null;
            return (
              <div key={se.step_id}>
                <StepNode
                  step={step}
                  index={idx}
                  isLast={idx === execution.step_executions.length - 1}
                  executionStatus={se.status}
                  onApprove={se.status === 'awaiting_approval' ? () => approveStep(execution.id, se.step_id) : undefined}
                  onReject={se.status === 'awaiting_approval' ? () => rejectStep(execution.id, se.step_id) : undefined}
                />
                {se.output && (
                  <div className="ml-6 -mt-2 mb-3 px-3 py-1.5 text-xs font-mono text-muted-foreground bg-surface-sunken rounded">
                    → {se.output}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {execution.completed_at && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-card text-xs text-muted-foreground">
            Completed at {new Date(execution.completed_at).toLocaleString()}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExecutionDetail;
