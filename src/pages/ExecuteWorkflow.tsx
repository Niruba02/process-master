import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Play } from 'lucide-react';

const ExecuteWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getWorkflow, executeWorkflow } = useWorkflows();
  const navigate = useNavigate();
  const workflow = getWorkflow(id!);
  const [inputData, setInputData] = useState<Record<string, unknown>>({});

  if (!workflow) return (
    <AppLayout><div className="container py-16 text-center text-muted-foreground">Workflow not found.</div></AppLayout>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const execId = executeWorkflow(workflow.id, inputData);
    navigate(`/executions/${execId}`);
  };

  const updateField = (key: string, value: string, type: string) => {
    setInputData(prev => ({
      ...prev,
      [key]: type === 'number' ? (value === '' ? '' : Number(value)) : type === 'boolean' ? value === 'true' : value,
    }));
  };

  return (
    <AppLayout>
      <div className="container py-8 max-w-2xl">
        <Link to={`/workflows/${workflow.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {workflow.name}
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Execute: {workflow.name}</h1>
          <p className="text-sm text-muted-foreground mb-8">Provide input data to start a new execution.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(workflow.input_schema).map(([key, schema]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-1">
                {key} <span className="text-muted-foreground font-mono text-xs">({schema.type})</span>
                {schema.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {schema.allowed_values ? (
                <select
                  required={schema.required}
                  onChange={e => updateField(key, e.target.value, schema.type)}
                  className="w-full px-3 py-2 text-sm bg-card border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  {schema.allowed_values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : schema.type === 'boolean' ? (
                <select
                  onChange={e => updateField(key, e.target.value, schema.type)}
                  className="w-full px-3 py-2 text-sm bg-card border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              ) : (
                <input
                  type={schema.type === 'number' ? 'number' : 'text'}
                  required={schema.required}
                  onChange={e => updateField(key, e.target.value, schema.type)}
                  className="w-full px-3 py-2 text-sm bg-card border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          ))}

          <button type="submit"
            className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Start Execution
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default ExecuteWorkflow;
