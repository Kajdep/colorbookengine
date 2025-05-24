"use client"

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter, Page } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, FileText, ImageIcon, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';

interface PageSequencerProps {
  chapters: Chapter[];
  onUpdateChapters: (updatedChapters: Chapter[]) => void;
  projectId: string;
}

interface SortablePageItemProps {
  page: Page;
  chapterId: string; // Needed for unique sortable IDs if page IDs are not globally unique
  projectId: string;
  pageIndex: number; // For display
  onDeletePage: (chapterId: string, pageId: string) => void;
}

function SortablePageItem({ page, chapterId, projectId, pageIndex, onDeletePage }: SortablePageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${chapterId}-${page.id}` }); // Unique ID for sortable item

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const pageTypeIcon = page.type === 'text' ? <FileText className="h-5 w-5 text-blue-500" /> : 
                       page.type === 'image' ? <ImageIcon className="h-5 w-5 text-green-500" /> :
                       <FileText className="h-5 w-5 text-gray-500" />;

  // Basic alternating background for pairing simulation
  const pairingStyle = pageIndex % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900/50';

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={`mb-2 rounded-lg shadow ${pairingStyle}`}>
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button {...listeners} className="cursor-grab p-1">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            {pageTypeIcon}
            <span className="font-medium">Page {pageIndex + 1}</span>
            <span className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">
              ({page.type === 'text' ? (page.textContent?.substring(0,20) || 'Text') : (page.imageAssetId || 'Image')}{page.type === 'text' && (page.textContent?.length || 0) > 20 ? '...' : ''})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/story/edit/${projectId}/${page.id}`}> {/* Assuming edit page structure */}
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDeletePage(chapterId, page.id)}>
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export function PageSequencer({ chapters: initialChapters, onUpdateChapters, projectId }: PageSequencerProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);

  React.useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDeletePage = (chapterId: string, pageId: string) => {
    console.log(`Attempting to delete page ${pageId} from chapter ${chapterId}`); // Placeholder
    const newChapters = chapters.map(chapter => {
      if (chapter.title === chapterId) { // Assuming chapter.title is unique and used as ID here
        return {
          ...chapter,
          pages: chapter.pages.filter(page => page.id !== pageId),
        };
      }
      return chapter;
    });
    setChapters(newChapters);
    onUpdateChapters(newChapters);
    // Add toast notification if needed
  };


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIdParts = String(active.id).split('-');
      const overIdParts = String(over.id).split('-');

      const activeChapterId = activeIdParts[0];
      const activePageId = activeIdParts.slice(1).join('-'); // Page ID might contain hyphens
      
      const overChapterId = overIdParts[0];
      // const overPageId = overIdParts.slice(1).join('-'); // Not directly used for finding new index if items are different

      if (activeChapterId !== overChapterId) {
        // For now, only allow reordering within the same chapter
        console.warn("Cross-chapter drag & drop is not yet supported.");
        return;
      }
      
      setChapters((prevChapters) => {
        const chapterIndex = prevChapters.findIndex(c => c.title === activeChapterId); // Assuming chapter title is used as ID
        if (chapterIndex === -1) return prevChapters;

        const chapterToUpdate = prevChapters[chapterIndex];
        const oldPageIndex = chapterToUpdate.pages.findIndex(p => p.id === activePageId);
        
        // Determine the new index based on the 'over' item.
        // The 'over.id' will be in the format 'chapterId-pageId'. We need the pageId part.
        const overPageIdRaw = String(over.id).substring(overChapterId.length + 1);
        const newPageIndex = chapterToUpdate.pages.findIndex(p => p.id === overPageIdRaw);

        if (oldPageIndex === -1 || newPageIndex === -1) return prevChapters;

        const updatedPages = arrayMove(chapterToUpdate.pages, oldPageIndex, newPageIndex);
        
        const newChapters = [...prevChapters];
        newChapters[chapterIndex] = {
          ...chapterToUpdate,
          pages: updatedPages.map((page, index) => ({ ...page, pageNumber: index +1 })), // Update page numbers
        };
        
        onUpdateChapters(newChapters);
        return newChapters;
      });
    }
  }

  if (!chapters || chapters.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No chapters or pages to display. Add content to your story.
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <Card key={chapter.title}> {/* Using chapter.title as key, ensure it's unique */}
            <CardHeader>
              <CardTitle>{chapter.title}</CardTitle>
              {/* Add Chapter Actions (e.g., Add Page to this Chapter) here if needed */}
            </CardHeader>
            <CardContent>
              <SortableContext items={chapter.pages.map(p => `${chapter.title}-${p.id}`)} strategy={verticalListSortingStrategy}>
                {chapter.pages.length > 0 ? (
                  chapter.pages.map((page, index) => (
                    <SortablePageItem 
                      key={`${chapter.title}-${page.id}`} 
                      page={page} 
                      chapterId={chapter.title} // Pass chapter title as chapterId
                      projectId={projectId}
                      pageIndex={index}
                      onDeletePage={handleDeletePage}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground py-4 text-center">This chapter has no pages yet.</p>
                )}
              </SortableContext>
              {/* Button to add a new page to this specific chapter could go here */}
               <Button variant="outline" size="sm" className="mt-4">
                 <Link href={`/story/new?projectId=${projectId}&chapterId=${chapter.title}`}> {/* Placeholder chapterId */}
                    Add Page to {chapter.title}
                 </Link>
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DndContext>
  );
}
