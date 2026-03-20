import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import AppLayout from '@/components/AppLayout';
import { ArrowRight, Play, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { workflows, executions, deleteWorkflow } = useWorkflows();

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.is_active).length,
    running: executions.filter(e => e.status === 'running').length,
    completed: executions.filter(e => e.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Workflows</h1>
          <p className="text-sm text-muted-foreground mb-8">Design, execute, and track your automated processes.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Workflows', value: stats.total, color: 'text-foreground' },
            { label: 'Active', value: stats.active, color: 'text-success' },
            { label: 'Running', value: stats.running, color: 'text-info' },
            { label: 'Completed', value: stats.completed, color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Workflow List */}
        <div className="space-y-3">
          {workflows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-2">No workflows yet.</p>
              <Link to="/workflows/new" className="text-primary hover:underline text-sm">Create your first workflow →</Link>
            </div>
          ) : (
            workflows.map((wf, i) => (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${wf.is_active ? 'bg-success animate-pulse-glow' : 'bg-muted-foreground'}`} />
                  <div>
                    <Link to={`/workflows/${wf.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {wf.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">v{wf.version}</span>
                      <span className="text-xs text-muted-foreground">{wf.steps.length} steps</span>
                      <span className="text-xs text-muted-foreground">{Object.keys(wf.input_schema).length} fields</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/workflows/${wf.id}/execute`}
                    className="p-2 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Execute">
                    <Play className="w-4 h-4" />
                  </Link>
                  <Link to={`/workflows/${wf.id}`}
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={() => deleteWorkflow(wf.id)}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
