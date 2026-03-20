import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import AppLayout from '@/components/AppLayout';
import StepNode from '@/components/StepNode';
import AddStepDialog from '@/components/AddStepDialog';
import { Plus, Play, Settings, Trash2, ArrowLeft } from 'lucide-react';

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getWorkflow, removeStep, updateWorkflow } = useWorkflows();
  const navigate = useNavigate();
  const [showAddStep, setShowAddStep] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const workflow = getWorkflow(id!);
  if (!workflow) return (
    <AppLayout>
      <div className="container py-16 text-center text-muted-foreground">Workflow not found.</div>
    </AppLayout>
  );

  const orderedSteps = (() => {
    if (!workflow.start_step_id) return [];
    const steps = [];
    let current = workflow.steps.find(s => s.id === workflow.start_step_id);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      steps.push(current);
      current = current.next_step_id ? workflow.steps.find(s => s.id === current!.next_step_id) : undefined;
    }
    return steps;
  })();

  return (
    <AppLayout>
      <div className="container py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{workflow.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-muted-foreground">v{workflow.version}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${workflow.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {workflow.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateWorkflow(workflow.id, { is_active: !workflow.is_active })}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
                {workflow.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <Link to={`/workflows/${workflow.id}/execute`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90">
                <Play className="w-3 h-3" /> Execute
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Input Schema Preview */}
        <div className="mb-8 p-4 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-2">Input Schema</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(workflow.input_schema).map(([key, schema]) => (
              <div key={key} className="px-3 py-2 rounded-md bg-surface-sunken text-xs">
                <span className="font-mono font-medium text-foreground">{key}</span>
                <span className="text-muted-foreground ml-1.5">{schema.type}</span>
                {schema.required && <span className="text-destructive ml-1">*</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Steps ({orderedSteps.length})</h3>
          <button onClick={() => setShowAddStep(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Step
          </button>
        </div>

        {orderedSteps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            No steps yet. Add your first step to build the workflow.
          </div>
        ) : (
          <div>
            {orderedSteps.map((step, idx) => (
              <div key={step.id} className="relative group">
                <StepNode step={step} index={idx} isLast={idx === orderedSteps.length - 1} onClick={() => setSelectedStepId(step.id === selectedStepId ? null : step.id)} />
                {selectedStepId === step.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-6 mb-3 p-3 bg-surface-sunken rounded-md text-xs space-y-1">
                    {step.approver && <p><span className="text-muted-foreground">Approver:</span> <span className="text-foreground">{step.approver}</span></p>}
                    {step.notification_channel && <p><span className="text-muted-foreground">Channel:</span> <span className="text-foreground">{step.notification_channel}</span></p>}
                    {step.notification_message && <p><span className="text-muted-foreground">Message:</span> <span className="text-foreground">{step.notification_message}</span></p>}
                    {step.conditions?.map((c, ci) => (
                      <p key={ci}><span className="text-muted-foreground">Condition:</span> <span className="font-mono text-foreground">{c.field} {c.operator} {String(c.value)}</span></p>
                    ))}
                    <button onClick={() => removeStep(workflow.id, step.id)} className="mt-2 text-destructive hover:underline flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove Step
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}

        <AddStepDialog workflowId={workflow.id} open={showAddStep} onClose={() => setShowAddStep(false)} />
      </div>
    </AppLayout>
  );
};

export default WorkflowDetail;
