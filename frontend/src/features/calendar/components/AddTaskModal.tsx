'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronDown, Archive } from 'lucide-react';
import { useTagCreation } from '@/hooks/useTagCreation';
import EditTagModal from '@/components/EditTagModal';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { WeeklyGoal } from '@/features/weekly-goals/types';
import { getMondayOfWeek } from '@/utils/dateUtils';
import { Tag } from '@/types/tag';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskBlueprint>) => Promise<void>;
  date: Date;
  tags: Tag[];
  weeklyGoals?: WeeklyGoal[]; // Optional - can be passed from parent
  task?: TaskBlueprint; // Optional - if provided, modal is in edit mode
  onDelete?: () => void; // Optional - delete handler for edit mode
  onMoveToBacklog?: () => void; // Optional - move to backlog handler for edit mode
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  date,
  tags,
  weeklyGoals = [],
  task,
  onDelete,
  onMoveToBacklog,
}: AddTaskModalProps) {
  const isEditMode = !!task;
  // Initialize state from task prop if in edit mode (component remounts via key prop)
  const [title, setTitle] = useState(() => task?.title || '');
  const [description, setDescription] = useState(() => task?.description || '');
  const [selectedTag, setSelectedTag] = useState<string>(() => task?.tag || '');
  const [selectedGoal, setSelectedGoal] = useState<string>(() => task?.weeklyGoalId || '');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const goalDropdownRef = useRef<HTMLDivElement>(null);

  // Tag creation hook
  const tagCreation = useTagCreation({
    onTagCreated: (newTag) => setSelectedTag(newTag.name),
    onExistingTagFound: (existingTag) => setSelectedTag(existingTag.name),
  });

  // Filter weekly goals for current week
  const currentWeekGoals = useMemo(() => weeklyGoals.filter((goal) => {
    const goalWeekStart = getMondayOfWeek(goal.weekStart);
    const currentWeekStart = getMondayOfWeek(date);
    return goalWeekStart.getTime() === currentWeekStart.getTime() && !goal.completed;
  }), [weeklyGoals, date]);

  const selectedTagObj = useMemo(() => tags.find((t) => t.name === selectedTag), [tags, selectedTag]);
  const selectedGoalObj = useMemo(() => currentWeekGoals.find((g) => g.id === selectedGoal), [currentWeekGoals, selectedGoal]);


  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
      if (
        goalDropdownRef.current &&
        !goalDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGoalDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen || isGoalDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isTagDropdownOpen, isGoalDropdownOpen]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !tagCreation.modalProps.isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose, tagCreation.modalProps.isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;

    const taskData: Partial<TaskBlueprint> = {
      title: title.trim(),
      description: description.trim(),
      tag: selectedTag || undefined,
      weeklyGoalId: selectedGoal || undefined,
    };

    // In edit mode, include the task ID
    if (isEditMode && task) {
      taskData.id = task.id;
    }

    onSave(taskData);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/5 z-40" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="w-full max-w-[560px] bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-visible"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 pt-5 pb-2">
            <h2 className="text-[#1b1b1b] text-lg font-medium tracking-normal">
              {isEditMode ? 'Edit Task' : 'Add Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#9e9e9e] hover:text-[#6d6d6d] transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d0d0d0]"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.66} />
            </button>
          </div>

          {/* Body Content */}
          <div className="px-6 pt-4 pb-0 flex flex-col gap-5">
            {/* Task Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#6d6d6d] text-xs font-medium">Task name</label>
              <div className="w-full border border-[#d0d0d0] rounded-lg bg-white px-3 py-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task name"
                  className="w-full text-[#1b1b1b] text-base font-normal placeholder-[#9ca3af] outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#6d6d6d] text-xs font-medium">Description (optional)</label>
              <div className="w-full border border-[#d0d0d0] rounded-lg bg-white px-3 py-2 h-20">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description..."
                  className="w-full h-full text-[#1b1b1b] text-sm font-normal resize-none outline-none bg-transparent leading-5 placeholder-[#9ca3af]"
                />
              </div>
            </div>

            {/* Weekly Goals (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#6d6d6d] text-xs font-medium">Weekly goals (optional)</label>
              <div ref={goalDropdownRef} className="relative">
                <div
                  className={`w-full border rounded-lg bg-white overflow-hidden cursor-pointer transition-colors ${
                    isGoalDropdownOpen
                      ? 'border-[#3CBF6F] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1),0_0_0_1px_rgba(60,191,111,0.1)]'
                      : 'border-[#d0d0d0] hover:border-gray-400'
                  }`}
                  onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                >
                  {/* Dropdown Header */}
                  <div className={`flex justify-between items-center px-3 py-2 ${isGoalDropdownOpen ? 'border-b border-[#EEEED8]' : ''}`}>
                    <span className="text-[#1b1b1b] text-sm font-normal">
                      {selectedGoalObj ? selectedGoalObj.text : 'Select goals...'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6d6d6d] transition-transform ${
                        isGoalDropdownOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  {/* Dropdown List Items */}
                  {isGoalDropdownOpen && (
                    <div className="flex flex-col py-1">
                      {currentWeekGoals.length > 0 ? (
                        currentWeekGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className={`px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                              selectedGoal === goal.id ? 'bg-gray-50' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGoal(selectedGoal === goal.id ? '' : goal.id);
                              setIsGoalDropdownOpen(false);
                            }}
                          >
                            <span className="text-[#1b1b1b] text-sm font-normal">{goal.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1.5 text-[#6d6d6d] text-sm font-normal">
                          No goals available for this week
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#6d6d6d] text-xs font-medium">Tags (optional)</label>
              <div ref={tagDropdownRef} className="relative">
                <div
                  className={`w-full border rounded-lg bg-white px-3 py-2 flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors ${
                    isTagDropdownOpen ? 'border-[#3CBF6F]' : 'border-[#d0d0d0]'
                  }`}
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                >
                  <div className="flex items-center gap-2">
                    {selectedTagObj && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: selectedTagObj.color }}
                      />
                    )}
                    <span className="text-[#6d6d6d] text-sm font-normal">
                      {selectedTagObj ? selectedTagObj.name : 'Select tags...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6d6d6d] transition-transform ${
                      isTagDropdownOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                {/* Dropdown List Items */}
                {isTagDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#d0d0d0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="flex flex-col py-1">
                      {tags.map((tag) => (
                        <div
                          key={tag.id}
                          className={`px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                            selectedTag === tag.name ? 'bg-gray-50' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(selectedTag === tag.name ? '' : tag.name);
                            setIsTagDropdownOpen(false);
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-[#1b1b1b] text-sm font-normal">{tag.name}</span>
                        </div>
                      ))}
                      <div
                        className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer border-t border-[#d0d0d0] mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          tagCreation.openAddModal();
                          setIsTagDropdownOpen(false);
                        }}
                      >
                        <span className="text-[#3CBF6F] text-sm font-medium">+ Add new tag</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 pt-2 pb-6 mt-4 flex justify-between items-center gap-3">
            {/* Left side buttons - only show in edit mode */}
            {isEditMode ? (
              <div className="flex items-center gap-3">
                {onMoveToBacklog && (
                  <button
                    onClick={() => {
                      onMoveToBacklog();
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-[#6d6d6d] bg-white border border-[#d0d0d0] hover:border-[#9e9e9e] hover:text-[#1b1b1b] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d0d0d0] focus:ring-offset-2 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" strokeWidth={1.5} />
                    Move to Backlog
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#E86858] hover:bg-[#D65A4B] rounded-lg shadow-[0_1px_2px_rgba(232,104,88,0.2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E86858] focus:ring-offset-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}
            
            {/* Right side buttons */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-6 py-2 bg-[#3CBF6F] hover:bg-[#34a861] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3CBF6F]"
              >
                {isEditMode ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tag Modal */}
      <EditTagModal {...tagCreation.modalProps} />
    </>
  );
}
