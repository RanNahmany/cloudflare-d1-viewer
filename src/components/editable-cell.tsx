"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";

interface EditableCellProps {
  value: any;
  onSave: (newValue: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  className?: string;
}

export function EditableCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  className,
}: EditableCellProps) {
  const [editValue, setEditValue] = React.useState(value?.toString() ?? "");
  const [hasChanged, setHasChanged] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<any>(null);
  const isProcessingRef = React.useRef(false);

  // Reset state when value changes or editing stops
  React.useEffect(() => {
    setEditValue(value?.toString() ?? "");
    setHasChanged(false);
    isProcessingRef.current = false;
  }, [value]);

  // Focus management when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (inputRef.current && !isProcessingRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  }, [isEditing]);

  // Bulletproof focus detection using multiple event types
  React.useEffect(() => {
    if (!isEditing) return;

    const handleFocusOut = (e: FocusEvent) => {
      // Check if focus is moving outside our component
      if (
        containerRef.current &&
        !containerRef.current.contains(e.relatedTarget as Node)
      ) {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          if (hasChanged) {
            onSave(editValue);
          } else {
            onCancel();
          }
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside our component while editing
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          // Use setTimeout to allow the click to complete
          setTimeout(() => {
            if (hasChanged) {
              onSave(editValue);
            } else {
              onCancel();
            }
          }, 0);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key to move focus away
      if (
        e.key === "Tab" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          if (hasChanged) {
            onSave(editValue);
          } else {
            onCancel();
          }
        }
      }
    };

    // Add event listeners with capture phase for maximum reliability
    document.addEventListener("focusout", handleFocusOut, true);
    document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("focusout", handleFocusOut, true);
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isEditing, hasChanged, editValue, onSave, onCancel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    setHasChanged(newValue !== (value?.toString() ?? ""));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        if (hasChanged) {
          onSave(editValue);
        } else {
          onCancel();
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        setEditValue(value?.toString() ?? "");
        setHasChanged(false);
        onCancel();
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onStartEdit();
    }
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-8 text-sm border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            className,
          )}
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      ref={containerRef}
      type="button"
      className={cn(
        "max-w-[200px] truncate cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors min-h-[32px] flex items-center text-left bg-transparent border-none",
        className,
      )}
      onClick={handleClick}
      title="Click to edit"
    >
      {value?.toString() ?? ""}
    </button>
  );
}
