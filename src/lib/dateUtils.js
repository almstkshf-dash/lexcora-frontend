export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const now = new Date();
  const deadline = new Date(endDate);
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return {
    days: daysRemaining,
    isOverdue: daysRemaining <= 0,
    isUrgent: daysRemaining <= 7 && daysRemaining > 0
  };
};

export const formatDate = (dateString, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-AE', options);
};

export const formatTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-AE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
