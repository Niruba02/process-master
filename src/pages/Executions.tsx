import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import AppLayout from '@/components/AppLayout';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  running: <Loader2 className="w-4 h-4 text-info animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  paused: <Loader2 className="w-4 h-4 text-warning" />,
};

const Executions: React.FC = () => {
  const { executions } = useWorkflows();

  return (
    <AppLayout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Executions</h1>
          <p className="text-sm text-muted-foreground mb-8">Track all workflow executions and their progress.</p>
        </motion.div>

        {executions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No executions yet. <Link to="/" className="text-primary hover:underline">Execute a workflow →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {[...executions].reverse().map((exec, i) => (
              <motion.div
                key={exec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/executions/${exec.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {statusIcons[exec.status]}
                    <div>
                      <span className="font-medium text-foreground">{exec.workflow_name}</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">{exec.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground">
                          {exec.step_executions.filter(s => s.status === 'completed').length}/{exec.step_executions.length} steps
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exec.started_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Executions;
