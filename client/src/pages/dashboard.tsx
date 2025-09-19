import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Grid, List, StickyNote } from 'lucide-react';
import { Note } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { WelcomeSection } from '@/components/layout/welcome-section';
import { NoteCard } from '@/components/notes/note-card';
import { CreateNoteModal } from '@/components/notes/create-note-modal';
import { DeleteNoteModal } from '@/components/notes/delete-note-modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tokenStorage } from '@/lib/auth';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
    queryFn: async () => {
      const token = tokenStorage.get();
      const response = await fetch('/api/notes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Filter and sort notes
  const filteredAndSortedNotes = React.useMemo(() => {
    let filtered = notes;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.category && note.category.toLowerCase().includes(query))
      );
    }

    // Sort notes
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'oldest':
          return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
        case 'recent':
        default:
          return new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime();
      }
    });

    return filtered;
  }, [notes, searchQuery, sortOption]);

  // Calculate stats
  const totalNotes = notes.length;
  const thisWeekNotes = React.useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return notes.filter(note => new Date(note.createdAt!) > oneWeekAgo).length;
  }, [notes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsCreateModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreateModalOpen(true);
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingNote(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  if (!isAuthenticated) {
    return null; // Will be handled by auth routing
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <WelcomeSection totalNotes={totalNotes} thisWeekNotes={thisWeekNotes} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notes Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Your Notes</h3>
            <p className="text-gray-600 mt-1">Organize your thoughts and ideas</p>
          </div>
          <Button
            onClick={handleCreateNote}
            className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <Plus className="mr-2" size={16} />
            New Note
          </Button>
        </div>

        {/* Notes Filter/Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Notes Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedNotes.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAndSortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <StickyNote className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start by creating your first note to organize your thoughts'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNote} className="bg-blue-600 text-white hover:bg-blue-700">
                Create Your First Note
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={handleCreateNote}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 md:hidden"
      >
        <Plus size={20} />
      </Button>

      {/* Modals */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        editingNote={editingNote}
      />

      <DeleteNoteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        note={noteToDelete}
      />
    </div>
  );
}
