import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import type { StepType } from '@/types/workflow';
import { X } from 'lucide-react';

interface AddStepDialogProps {
  workflowId: string;
  open: boolean;
  onClose: () => void;
}

const AddStepDialog: React.FC<AddStepDialogProps> = ({ workflowId, open, onClose }) => {
  const { addStep } = useWorkflows();
  const [name, setName] = useState('');
  const [type, setType] = useState<StepType>('task');
  const [description, setDescription] = useState('');
  const [approver, setApprover] = useState('');
  const [channel, setChannel] = useState<'email' | 'slack' | 'ui'>('email');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStep(workflowId, {
      name,
      type,
      description,
      next_step_id: null,
      ...(type === 'approval' ? { approver } : {}),
      ...(type === 'notification' ? { notification_channel: channel, notification_message: message } : {}),
    });
    setName(''); setDescription(''); setApprover(''); setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md p-6 bg-card rounded-xl border border-border shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Step</h3>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <div className="flex gap-2">
                  {(['task', 'approval', 'notification'] as StepType[]).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex-1 py-2 text-xs font-mono font-semibold uppercase rounded-md border transition-colors ${type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {type === 'approval' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Approver Email</label>
                  <input value={approver} onChange={e => setApprover(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              )}

              {type === 'notification' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Channel</label>
                    <select value={channel} onChange={e => setChannel(e.target.value as 'email' | 'slack' | 'ui')}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="email">Email</option>
                      <option value="slack">Slack</option>
                      <option value="ui">UI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </>
              )}

              <button type="submit"
                className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                Add Step
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddStepDialog;
