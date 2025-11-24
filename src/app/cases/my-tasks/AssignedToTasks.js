'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSelector } from 'react-redux';
import { selectUser, selectAuth } from '@/redux/slices/authSlice';
import { getAssignedToTasks } from '@/app/services/api/tasks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import EditTaskModal from '@/app/cases/[id]/edit/tasks/EditTaskModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, AlertCircle, User, Eye, RefreshCw } from 'lucide-react';

const AssignedToTasks = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
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
  
  // Modal state
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Fetch assigned tasks using SWR
  const { data: tasksData, error, isLoading, mutate } = useSWR(
    userId ? [`/tasks/assigned-to/${userId}`, userId] : null,
    () => getAssignedToTasks(userId),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'normal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancel':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return t('tasks.priorityUrgent');
      case 'high':
        return t('tasks.priorityHigh');
      case 'normal':
        return t('tasks.priorityNormal');
      default:
        return priority;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('tasks.statusPending');
      case 'in_progress':
        return t('tasks.statusInProgress');
      case 'completed':
        return t('tasks.statusCompleted');
      case 'cancelled':
        return t('tasks.statusCancel');
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
  };

  const handleEditTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsEditTaskModalOpen(true);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsEditTaskModalOpen(false);
    setSelectedTaskId(null);
    
    // Mutate (refresh) the data if needed
    if (shouldRefresh) {
      mutate();
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('common.error')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive mb-2">{t('common.error')}</p>
          <p className="text-sm text-muted-foreground">{t('common.errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">{t('navigation.myTasks')}</h1>
          <p className="text-muted-foreground">
            {t('tasks.myTasksDescription') || 'View and manage tasks assigned to you'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('common.refresh') || 'Refresh'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('navigation.myTasks')}
          </CardTitle>
          <CardDescription>
            {tasksData?.data?.length > 0 
              ? `${tasksData.data.length} ${t('tasks.tasks')} ${t('tasks.assignedTo')} ${user.name || user.email}`
              : t('tasks.noTasks')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            </div>
          ) : tasksData?.data?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('common.id')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.taskTitle')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.description')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.priority')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.status')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.dueDate')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('tasks.assignedBy')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksData.data.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        #{task.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={task.description}>
                          {task.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(task.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {task.assigned_by_name || task.created_by || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">{t('tasks.noTasks')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('tasks.noTasksDescription') || 'No tasks have been assigned to you yet.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Modal is closing, refresh the data
            handleModalClose(true);
          } else {
            setIsEditTaskModalOpen(isOpen);
          }
        }}
        taskId={selectedTaskId}
      />
    </div>
  );
};

export default AssignedToTasks;
