'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { getCreatorTasks, deleteTask } from '@/app/services/api/tasks';
import { useResolvedUser } from '@/hooks/useResolvedUser';
import { useTaskUtils } from '@/hooks/useTaskUtils';
import { useDebounce } from '@/hooks/useDebounce';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
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
  Plus,
  Trash2,
  Search,
  Filter,
  Briefcase
} from 'lucide-react';

const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center space-x-4 space-x-reverse">
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
);

const MyTasks = () => {
  const { userId, isAuth, user } = useResolvedUser();
  const { 
    isRTL, t, formatDate, getPriorityBadgeColor, getStatusBadgeColor, 
    getPriorityLabel, getStatusLabel, isOverdue 
  } = useTaskUtils();

  // State for filters and pagination
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('active'); 
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal state
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch creator tasks using SWR
  const { data: response, error, isLoading, mutate } = useSWR(
    userId ? [`/tasks/creator/${userId}`, userId, status, debouncedSearch, page] : null,
    () => getCreatorTasks(userId, { 
      status: status === 'all' ? undefined : status, 
      search: debouncedSearch,
      page,
      limit
    }),
    {
      refreshInterval: 300000, 
      revalidateOnFocus: true
    }
  );

  const tasks = response?.data || [];
  const pagination = response?.pagination || { totalPages: 1, total: 0 };

  const handleEditTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsEditTaskModalOpen(true);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsEditTaskModalOpen(false);
    setSelectedTaskId(null);
    if (shouldRefresh) mutate();
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
      mutate();
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast.success(t('tasks.deleteSuccess') || 'Task deleted successfully');
    } catch (error) {
      const isPermissionError = error?.response?.status === 403;
      toast.error(isPermissionError ? t('tasks.deletePermissionError') : t('tasks.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuth && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground mt-1">
            {t('auth.verifying')}
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
          <Button variant="outline" className="mt-4" onClick={() => mutate()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('tasks.createdTasksTitle')}</h1>
          <p className="text-muted-foreground">
            {t('tasks.createdTasksDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="h-9"
          >
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('tasks.addTask')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t('common.search') + '...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
        <div>
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder={t('tasks.status')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('tasks.activeTasks')}</SelectItem>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('tasks.statusPending')}</SelectItem>
              <SelectItem value="in_progress">{t('tasks.statusInProgress')}</SelectItem>
              <SelectItem value="completed">{t('tasks.statusCompleted')}</SelectItem>
              <SelectItem value="cancelled">{t('tasks.statusCancel')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('tasks.createdTasksTitle')}
              </CardTitle>
              <CardDescription>
                {pagination.total > 0 
                  ? `${pagination.total} ${t('tasks.tasks')} ${t('tasks.found')}`
                  : t('tasks.noCreatedTasksDescription')
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('tasks.taskTitle')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('cases.case')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('tasks.priority')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('tasks.status')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('tasks.dueDate')}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t('tasks.assignedTo')}</TableHead>
                    <TableHead className={isRTL ? 'text-center' : 'text-center'}>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const overdue = isOverdue(task.due_date, task.status);
                    return (
                      <TableRow key={task.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground line-clamp-1">{task.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.case_number ? (
                            <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>{task.case_number}</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeColor(task.priority)} className="capitalize">
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeColor(task.status)} className="capitalize">
                            {getStatusLabel(task.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(task.due_date)}
                            {overdue && <AlertCircle className="h-3 w-3" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="truncate max-w-[120px]">{task.assigned_to_name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTask(task.id)}
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{t('tasks.noTasks')}</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                {search || status !== 'active' 
                  ? t('tasks.noTasksFoundForFilters')
                  : t('tasks.noCreatedTasksDescription')}
              </p>
              {(search || status !== 'active') && (
                <Button 
                  variant="link" 
                  onClick={() => { setSearch(''); setStatus('active'); }}
                  className="mt-2"
                >
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
        {pagination.totalPages > 1 && (
          <div className="border-t p-4 flex justify-center bg-muted/10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer"
                  />
                </PaginationItem>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.totalPages || 
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return <PaginationItem key={pageNum}><PaginationEllipsis /></PaginationItem>;
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            mutate();
            setIsAddTaskModalOpen(false);
          } else {
            setIsAddTaskModalOpen(isOpen);
          }
        }}
        caseId={null}
        onTaskCreated={() => mutate()}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleModalClose(true);
          } else {
            setIsEditTaskModalOpen(isOpen);
          }
        }}
        taskId={selectedTaskId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tasks.deleteTask')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tasks.confirmDeleteMessage')}
              {taskToDelete && (
                <span className="mt-2 p-2 bg-muted rounded block font-medium">
                  #{taskToDelete.id} - {taskToDelete.title}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
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
