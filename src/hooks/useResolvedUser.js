import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectAuth } from '@/redux/slices/authSlice';

export function useResolvedUser() {
  const user = useSelector(selectUser);
  const auth = useSelector(selectAuth);

  const resolvedUser = useMemo(() => {
    const fromState = user || auth?.user || {};
    const fromStorage = (() => {
      if (typeof window === 'undefined') return {};
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    })();
    return {
      ...fromStorage,
      ...fromState,
    };
  }, [user, auth]);

  const userId =
    resolvedUser?.id ||
    resolvedUser?._id ||
    resolvedUser?.user_id ||
    resolvedUser?.job_id ||
    auth?.jobId ||
    null;

  return {
    user: resolvedUser,
    userId,
    isAuth: !!userId
  };
}
