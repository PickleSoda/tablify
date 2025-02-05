'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { createProject } from '../actions';

export function ProjectForm({teamId}:{teamId: number}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  console.log(searchParams);
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(
    createProject,
    { error: '' }
  );

  return (
    <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-purple-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a New Project
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="teamId" value={teamId} />
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name
            </Label>
            <div className="mt-1">
              <Input
                id="name"
                name="name"
                type="text"
                required
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter project name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Project Description
            </Label>
            <div className="mt-1">
              <Input
                id="description"
                name="description"
                type="text"
                required
                maxLength={500}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter project description"
              />
            </div>
          </div>

          {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

          <div>
            <Button type="submit" className="w-full flex justify-center" disabled={pending}>
              {pending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
