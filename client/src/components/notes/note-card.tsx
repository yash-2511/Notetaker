import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Note } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'work':
        return 'bg-blue-100 text-blue-700';
      case 'personal':
        return 'bg-green-100 text-green-700';
      case 'travel':
        return 'bg-purple-100 text-purple-700';
      case 'ideas':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPreview = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
          {note.title}
        </h4>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 h-auto"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="text-gray-400 hover:text-red-500 p-1 h-auto"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
        {getPreview(note.content)}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(note.updatedAt)}</span>
        {note.category && (
          <span className={`px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
            {note.category}
          </span>
        )}
      </div>
    </div>
  );
}
