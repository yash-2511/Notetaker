import React from 'react';
import { useAuth } from '@/hooks/use-auth';

interface WelcomeSectionProps {
  totalNotes: number;
  thisWeekNotes: number;
}

export function WelcomeSection({ totalNotes, thisWeekNotes }: WelcomeSectionProps) {
  const { user } = useAuth();

  const firstName = user?.name.split(' ')[0] || 'User';

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Welcome back, {firstName}! 👋
            </h2>
            <p className="text-blue-100">Ready to capture your thoughts and ideas?</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{totalNotes}</div>
                  <div className="text-blue-100">Total Notes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{thisWeekNotes}</div>
                  <div className="text-blue-100">This Week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
