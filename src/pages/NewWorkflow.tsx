import React from 'react';
import WorkflowForm from '@/components/WorkflowForm';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewWorkflow: React.FC = () => (
  <AppLayout>
    <div className="container py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Create Workflow</h1>
      <WorkflowForm />
    </div>
  </AppLayout>
);

export default NewWorkflow;
