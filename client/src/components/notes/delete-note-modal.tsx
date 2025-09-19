import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Note } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tokenStorage } from '@/lib/auth';

interface DeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

export function DeleteNoteModal({ isOpen, onClose, note }: DeleteNoteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const token = tokenStorage.get();
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete note');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: 'Success',
        description: 'Note deleted successfully!',
      });
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

  const handleDelete = () => {
    if (note) {
      deleteNoteMutation.mutate(note.id);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mr-4">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Note</h3>
              <p className="text-gray-600 text-sm">This action cannot be undone</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete "<span className="font-medium">{note.title}</span>"?
          </p>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleteNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
