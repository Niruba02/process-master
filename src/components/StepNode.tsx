import React from 'react';
import { motion } from 'framer-motion';
import type { Step } from '@/types/workflow';
import { CheckCircle2, Clock, AlertCircle, Pause, SkipForward, Loader2 } from 'lucide-react';
import type { StepExecutionStatus } from '@/types/workflow';

interface StepNodeProps {
  step: Step;
  index: number;
  isLast: boolean;
  executionStatus?: StepExecutionStatus;
  onApprove?: () => void;
  onReject?: () => void;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  task: 'bg-step-task',
  approval: 'bg-step-approval',
  notification: 'bg-step-notification',
};

const typeGlows: Record<string, string> = {
  task: 'step-glow-task',
  approval: 'step-glow-approval',
  notification: 'step-glow-notification',
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  running: <Loader2 className="w-4 h-4 text-info animate-spin" />,
  pending: <Clock className="w-4 h-4 text-muted-foreground" />,
  failed: <AlertCircle className="w-4 h-4 text-destructive" />,
  skipped: <SkipForward className="w-4 h-4 text-muted-foreground" />,
  awaiting_approval: <Pause className="w-4 h-4 text-warning" />,
};

const StepNode: React.FC<StepNodeProps> = ({ step, index, isLast, executionStatus, onApprove, onReject, onClick }) => {
  return (
    <div className="flex items-start gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`w-3 h-3 rounded-full ${typeColors[step.type]} ring-4 ring-background`}
        />
        {!isLast && <div className="w-px flex-1 bg-border min-h-[40px]" />}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.05 }}
        className={`flex-1 mb-3 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors ${executionStatus === 'running' || executionStatus === 'awaiting_approval' ? typeGlows[step.type] : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeColors[step.type]} text-primary-foreground`}>
              {step.type}
            </span>
            <span className="font-medium text-sm text-foreground">{step.name}</span>
          </div>
          {executionStatus && statusIcons[executionStatus]}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
        
        {executionStatus === 'awaiting_approval' && onApprove && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={e => { e.stopPropagation(); onApprove(); }}
              className="px-3 py-1 text-xs font-medium bg-success text-success-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Approve
            </button>
            <button
              onClick={e => { e.stopPropagation(); onReject?.(); }}
              className="px-3 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Reject
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StepNode;
