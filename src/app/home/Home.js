'use client';

import CasePetitions from "./CasePetitions"
import LastWeekSessions from "./LastWeekSessions"
import AppealsAndChallenges from "./AppealsAndChallenges"
import SessionWithNoDecision from "./SessionWithNoDecision"

function Home() {
  return (
    <div className="w-full min-h-screen">
     

      {/* Responsive Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
        {/* Each card wrapper with consistent height */}
        <div className="flex flex-col h-full">
          <SessionWithNoDecision />
        </div>
        
        <div className="flex flex-col h-full">
          <AppealsAndChallenges />
        </div>
        
        <div className="flex flex-col h-full">
          <CasePetitions />
        </div>
        
        <div className="flex flex-col h-full">
          <LastWeekSessions />
        </div>
      </div>
    </div>
  )
}

export default Home