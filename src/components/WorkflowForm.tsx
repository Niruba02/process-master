import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/store/WorkflowContext';
import type { InputSchema, InputFieldSchema } from '@/types/workflow';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';

const WorkflowForm: React.FC<{ existingId?: string }> = ({ existingId }) => {
  const { createWorkflow, updateWorkflow, getWorkflow } = useWorkflows();
  const navigate = useNavigate();
  const existing = existingId ? getWorkflow(existingId) : undefined;

  const [name, setName] = useState(existing?.name || '');
  const [fields, setFields] = useState<Array<{ key: string; schema: InputFieldSchema }>>(
    existing
      ? Object.entries(existing.input_schema).map(([key, schema]) => ({ key, schema }))
      : [{ key: '', schema: { type: 'string', required: true } }]
  );

  const addField = () => setFields(f => [...f, { key: '', schema: { type: 'string', required: false } }]);

  const removeField = (idx: number) => setFields(f => f.filter((_, i) => i !== idx));

  const updateField = (idx: number, updates: Partial<{ key: string; schema: InputFieldSchema }>) => {
    setFields(f => f.map((field, i) => i === idx ? { ...field, ...updates } : field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputSchema: InputSchema = {};
    fields.forEach(f => {
      if (f.key.trim()) inputSchema[f.key.trim()] = f.schema;
    });

    if (existingId) {
      updateWorkflow(existingId, { name, input_schema: inputSchema });
      navigate(`/workflows/${existingId}`);
    } else {
      const wf = createWorkflow(name, inputSchema);
      navigate(`/workflows/${wf.id}`);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Workflow Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="e.g. Expense Approval"
          className="w-full px-3 py-2 text-sm bg-card border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Input Schema</label>
          <button type="button" onClick={addField} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Field
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-surface-sunken rounded-md">
              <input
                value={field.key}
                onChange={e => updateField(idx, { key: e.target.value })}
                placeholder="field name"
                className="flex-1 px-2 py-1.5 text-sm bg-card border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <select
                value={field.schema.type}
                onChange={e => updateField(idx, { schema: { ...field.schema, type: e.target.value as 'string' | 'number' | 'boolean' } })}
                className="px-2 py-1.5 text-sm bg-card border border-input rounded text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
              </select>
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.schema.required}
                  onChange={e => updateField(idx, { schema: { ...field.schema, required: e.target.checked } })}
                  className="rounded border-input"
                />
                Required
              </label>
              <button type="button" onClick={() => removeField(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        {existingId ? 'Update Workflow' : 'Create Workflow'}
      </button>
    </motion.form>
  );
};

export default WorkflowForm;
