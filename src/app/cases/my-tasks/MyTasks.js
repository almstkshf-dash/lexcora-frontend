
'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSelector } from 'react-redux';
import { selectUser, selectAuth } from '@/redux/slices/authSlice';
import { getCreatorTasks, deleteTask } from '@/app/services/api/tasks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'react-toastify';
import EditTaskModal from '@/app/cases/[id]/edit/tasks/EditTaskModal';
import AddTaskModal from '@/app/cases/[id]/edit/tasks/AddTaskModal';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  User, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Trash2
} from 'lucide-react';

const MyTasks = () => {
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
    // Prefer state, then auth user, then storage
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
  
  // State for status filter
  const [activeStatus, setActiveStatus] = useState('pending');
  
  // Modal state
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch creator tasks using SWR
  const { data: tasksData, error, isLoading, mutate } = useSWR(
    userId ? [`/tasks/creator/${userId}`, userId, activeStatus] : null,
    () => getCreatorTasks(userId, activeStatus),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  // Status toggle buttons configuration
  const statusButtons = [
    {
      key: 'pending',
      icon: PauseCircle,
      label: t('tasks.statusPending'),
      variant: 'secondary',
      activeVariant: 'secondary'
    },
    {
      key: 'in_progress',
      icon: PlayCircle,
      label: t('tasks.statusInProgress'),
      variant: 'default',
      activeVariant: 'default'
    },
    {
      key: 'completed',
      icon: CheckCircle,
      label: t('tasks.statusCompleted'),
      variant: 'default',
      activeVariant: 'default'
    },
    {
      key: 'cancelled',
      icon: XCircle,
      label: t('tasks.statusCancel'),
      variant: 'destructive',
      activeVariant: 'destructive'
    }
  ];

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
      case 'cancelled':
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

  const handleStatusChange = (newStatus) => {
    setActiveStatus(newStatus);
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

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      // Refresh the data after successful deletion
      mutate();
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast.success(language === 'ar' ? 'تم حذف المهمة بنجاح' : 'Task deleted successfully');
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لحذف المهمة' : 'You do not have permission to delete this task'))
        : (error?.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء حذف المهمة' : 'Error deleting task'));
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteTask = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleCreateTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleAddTaskModalClose = (shouldRefresh = false) => {
    setIsAddTaskModalOpen(false);
    
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
          <h1 className="text-3xl font-bold">{t('tasks.createdTasksTitle')}</h1>
          <p className="text-muted-foreground">
            {t('tasks.createdTasksDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateTask}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {t('tasks.addTask')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('tasks.filterByStatus')}</CardTitle>
          <CardDescription>
            {t('tasks.filterByStatus')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusButtons.map((status) => {
              const IconComponent = status.icon;
              const isActive = activeStatus === status.key;
              return (
                <Button
                  key={status.key}
                  variant={isActive ? status.activeVariant : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(status.key)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {status.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('tasks.createdTasksTitle')}
          </CardTitle>
          <CardDescription>
            {tasksData?.data?.length > 0 
              ? `${tasksData.data.length} ${t('tasks.tasks')} - ${getStatusLabel(activeStatus)}`
              : t('tasks.noCreatedTasksDescription')
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
                      {t('tasks.assignedTo')}
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
                          {task.assigned_to_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {task.assigned_by_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                  {t('tasks.noCreatedTasksDescription')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Modal is closing, refresh the data
            handleAddTaskModalClose(true);
          } else {
            setIsAddTaskModalOpen(isOpen);
          }
        }}
        caseId={null}
        onTaskCreated={() => {
          mutate(); // Refresh the tasks list
        }}
      />

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasks.deleteTask')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tasks.confirmDeleteMessage')}
              {taskToDelete && (
                <span className="mt-2 p-2 bg-muted rounded inline-block">
                  <strong>#{taskToDelete.id} - {taskToDelete.title}</strong>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTask} disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTask}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTasks;
