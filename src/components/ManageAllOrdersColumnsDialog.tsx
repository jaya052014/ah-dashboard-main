import { useEffect, useRef } from 'react';
import type { AllOrdersColumnsState, AllOrdersColumnId } from './allOrdersColumns';
import { ALL_ORDERS_DEFAULT_COLUMNS, getDefaultAllOrdersColumnsState } from './allOrdersColumns';

type ManageAllOrdersColumnsDialogProps = {
  open: boolean;
  onClose: () => void;
  columnsState: AllOrdersColumnsState;
  onChange: (next: AllOrdersColumnsState) => void;
};

export function ManageAllOrdersColumnsDialog({
  open,
  onClose,
  columnsState,
  onChange,
}: ManageAllOrdersColumnsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open, onClose]);

  const toggleVisibility = (id: AllOrdersColumnId) => {
    onChange({
      ...columnsState,
      visible: {
        ...columnsState.visible,
        [id]: !columnsState.visible[id],
      },
    });
  };

  const moveColumn = (id: AllOrdersColumnId, direction: 'up' | 'down') => {
    const currentIndex = columnsState.order.indexOf(id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columnsState.order.length) return;

    const newOrder = [...columnsState.order];
    const [removed] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    onChange({ ...columnsState, order: newOrder });
  };

  const handleReset = () => {
    onChange(getDefaultAllOrdersColumnsState());
  };

  if (!open) return null;

  return (
    <div className="manage-columns-overlay">
      <div className="manage-columns-dialog" ref={dialogRef}>
        <div className="manage-columns-header">
          <div>
            <h3 className="manage-columns-title">Manage columns</h3>
            <p className="manage-columns-subtitle">Choose which columns to show and adjust their order.</p>
          </div>
          <button
            type="button"
            className="manage-columns-reset"
            onClick={handleReset}
          >
            Reset to default
          </button>
        </div>

        <div className="manage-columns-body">
          {columnsState.order.map((columnId, index) => {
            const column = ALL_ORDERS_DEFAULT_COLUMNS.find((c) => c.id === columnId);
            if (!column) return null;

            const isFirst = index === 0;
            const isLast = index === columnsState.order.length - 1;

            return (
              <div key={columnId} className="manage-columns-row">
                <label className="manage-columns-checkbox-label">
                  <input
                    type="checkbox"
                    checked={columnsState.visible[columnId]}
                    onChange={() => toggleVisibility(columnId)}
                    className="manage-columns-checkbox"
                  />
                  <span className="manage-columns-label-text">{column.label}</span>
                </label>
                <div className="manage-columns-reorder">
                  <button
                    type="button"
                    className="manage-columns-reorder-btn"
                    onClick={() => moveColumn(columnId, 'up')}
                    disabled={isFirst}
                    aria-label="Move up"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 10L8 6L4 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="manage-columns-reorder-btn"
                    onClick={() => moveColumn(columnId, 'down')}
                    disabled={isLast}
                    aria-label="Move down"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="manage-columns-footer">
          <button
            type="button"
            className="manage-columns-done-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

