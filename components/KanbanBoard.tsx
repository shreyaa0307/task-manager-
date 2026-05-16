"use client";

import { useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Calendar } from "lucide-react";
import { getPriorityBadge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

function SortableTask({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`clay-card rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing hover:border-primary/20 transition-all bg-card ${isOverdue ? 'border-destructive/20' : ''}`}
    >
      <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {getPriorityBadge(task.priority)}
        {task.dueDate && (
          <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</span>
        {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
      </div>
    </div>
  );
}

function KanbanColumn({ col, tasks, onTaskClick }: { col: any, tasks: any[], onTaskClick: (task: any) => void }) {
  const { setNodeRef } = useDroppable({ id: col.id });
  return (
    <div className="bg-secondary/20 rounded-2xl p-4 flex flex-col min-h-[500px]" ref={setNodeRef}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold">{col.title}</h3>
        <span className="bg-secondary px-2 py-1 rounded-full text-xs font-medium">{tasks.length}</span>
      </div>
      <div className="flex-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onStatusChange, onTaskClick }: { tasks: any[], onStatusChange: (id: string, status: string) => void, onTaskClick: (task: any) => void }) {
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(tasks.find(t => t.id === active.id) || null);
  };

  const handleDragEnd = (event: any) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overId = over.id;

    // Is it dropping over a column?
    if (columns.map(c => c.id).includes(overId as string)) {
      if (activeTask && activeTask.status !== overId) {
        onStatusChange(activeTask.id, overId as string);
      }
      return;
    }

    // Dropping over another task
    const overTask = tasks.find(t => t.id === overId);
    if (activeTask && overTask && activeTask.status !== overTask.status) {
      onStatusChange(activeTask.id, overTask.status);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <KanbanColumn 
            key={col.id} 
            col={col} 
            tasks={tasks.filter(t => t.status === col.id)} 
            onTaskClick={onTaskClick} 
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="clay-card rounded-xl p-4 opacity-80 rotate-2 scale-105 bg-card">
            <p className="text-sm font-medium">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
