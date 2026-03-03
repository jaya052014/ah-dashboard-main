import { useEffect, useRef } from 'react';
import type { DashboardBlocksState, DashboardBlockId } from './dashboardBlocks';
import { DASHBOARD_BLOCKS, getDefaultDashboardBlocksState } from './dashboardBlocks';

type SetUpYourViewDialogProps = {
  open: boolean;
  onClose: () => void;
  blocksState: DashboardBlocksState;
  onChange: (next: DashboardBlocksState) => void;
};

export function SetUpYourViewDialog({
  open,
  onClose,
  blocksState,
  onChange,
}: SetUpYourViewDialogProps) {
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

  const toggleVisibility = (id: DashboardBlockId) => {
    // Prevent toggling required blocks
    const block = DASHBOARD_BLOCKS.find((b) => b.id === id);
    if (block?.required) return;
    
    const updatedVisible = {
      ...blocksState.visible,
      [id]: !blocksState.visible[id],
    };
    
    // Ensure required blocks stay visible (defensive check)
    const requiredBlocks = DASHBOARD_BLOCKS.filter(b => b.required).map(b => b.id);
    requiredBlocks.forEach(requiredId => {
      updatedVisible[requiredId] = true;
    });
    
    onChange({
      ...blocksState,
      visible: updatedVisible,
    });
  };

  const moveBlock = (id: DashboardBlockId, direction: 'up' | 'down') => {
    const currentIndex = blocksState.order.indexOf(id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= blocksState.order.length) return;

    const newOrder = [...blocksState.order];
    const [removed] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    onChange({ ...blocksState, order: newOrder });
  };

  const handleReset = () => {
    onChange(getDefaultDashboardBlocksState());
  };

  if (!open) return null;

  return (
    <div className="manage-columns-overlay">
      <div className="manage-columns-dialog" ref={dialogRef}>
        <div className="manage-columns-header">
          <div>
            <h3 className="manage-columns-title">Set up your view</h3>
            <p className="manage-columns-subtitle">Choose which dashboard blocks to show and adjust their order.</p>
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
          {blocksState.order.map((blockId, index) => {
            const block = DASHBOARD_BLOCKS.find((b) => b.id === blockId);
            if (!block) return null;

            const isFirst = index === 0;
            const isLast = index === blocksState.order.length - 1;
            const isRequired = block.required === true;

            return (
              <div key={blockId} className="manage-columns-row">
                <label className={`manage-columns-checkbox-label ${isRequired ? "manage-columns-checkbox-label--disabled" : ""}`}>
                  <input
                    type="checkbox"
                    checked={isRequired ? true : blocksState.visible[blockId]}
                    onChange={() => toggleVisibility(blockId)}
                    disabled={isRequired}
                    className="manage-columns-checkbox"
                  />
                  <span className="manage-columns-label-text">{block.label}</span>
                </label>
                <div className="manage-columns-reorder">
                  <button
                    type="button"
                    className="manage-columns-reorder-btn"
                    onClick={() => moveBlock(blockId, 'up')}
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
                    onClick={() => moveBlock(blockId, 'down')}
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

