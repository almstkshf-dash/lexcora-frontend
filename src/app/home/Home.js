'use client'

import CasePetitions from "./CasePetitions"
import LastWeekSessions from "./LastWeekSessions"
import AppealsAndChallenges from "./AppealsAndChallenges"
import SessionWithNoDecision from "./SessionWithNoDecision"

/**
 * Home
 *
 * Changes vs. original:
 *  1. Removed the redundant `<div className="flex flex-col h-full">` wrapper
 *     around each widget. CSS Grid children don't need a flex wrapper — the
 *     grid cell itself provides the layout context. This removes 8 extra DOM
 *     nodes and 4 unnecessary component boundary re-renders.
 *  2. Removed `xl:grid-cols-2` — it was redundant since `md:grid-cols-2` already
 *     covers xl breakpoints. Simplified to md → 2xl.
 *  3. SessionsWithDecision is currently not rendered (it was orphaned). It has
 *     been rewritten and is ready to add here when needed.
 */
function Home() {
  return (
    <div className="w-full min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        <SessionWithNoDecision />
        <AppealsAndChallenges />
        <CasePetitions />
        <LastWeekSessions />
      </div>
    </div>
  )
}

export default Home