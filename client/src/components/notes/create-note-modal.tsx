import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { CreateNoteRequest, createNoteSchema, Note } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tokenStorage } from '@/lib/auth';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: Note | null;
}

export function CreateNoteModal({ isOpen, onClose, editingNote }: CreateNoteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateNoteRequest>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: editingNote?.title || '',
      content: editingNote?.content || '',
      category: editingNote?.category || '',
    },
  });

  // Reset form when editing note changes
  React.useEffect(() => {
    if (editingNote) {
      form.reset({
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category || '',
      });
    } else {
      form.reset({
        title: '',
        content: '',
        category: '',
      });
    }
  }, [editingNote, form]);

  const createNoteMutation = useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      const token = tokenStorage.get();
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: 'Success',
        description: 'Note created successfully!',
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      if (!editingNote) throw new Error('No note to update');
      
      const token = tokenStorage.get();
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: 'Success',
        description: 'Note updated successfully!',
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateNoteRequest) => {
    if (editingNote) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Note Title</Label>
            <Input
              {...form.register('title')}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Category</Label>
            <Select
              value={form.getValues('category')}
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="ideas">Ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Content</Label>
            <Textarea
              {...form.register('content')}
              rows={8}
              placeholder="Start writing your note..."
              className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {isPending ? 'Saving...' : editingNote ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
