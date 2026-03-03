import { useState } from "react";
import type { OrderRow } from "../data/orders";
import { OrderProgressBar, type OrderStage } from "./OrderProgressBar";

type OrderDetailsPanelProps = {
  order: OrderRow | null;
  isOpen: boolean;
  onClose: () => void;
};

type Comment = {
  id: number;
  author: string;
  text: string;
  createdAt: string;
};

const getOrderStage = (status: OrderRow["status"]): OrderStage => {
  switch (status) {
    case "Open":
      return "received";
    case "In Progress":
      return "in_progress";
    case "Delayed":
      return "in_progress"; // Delayed is still "in progress" state
    case "Completed":
      return "completed";
    default:
      return "received";
  }
};

const formatCommentDate = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OrderDetailsPanel({ order, isOpen, onClose }: OrderDetailsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Max Vertsanov",
      text: "Order is being monitored for SLA and cost savings.",
      createdAt: formatCommentDate(new Date(Date.now() - 86400000 * 2)), // 2 days ago
    },
    {
      id: 2,
      author: "System",
      text: "Waiting for additional customer approval.",
      createdAt: formatCommentDate(new Date(Date.now() - 86400000)), // 1 day ago
    },
  ]);
  const [newComment, setNewComment] = useState("");

  if (!isOpen || !order) {
    return null;
  }

  const orderStage = getOrderStage(order.status);
  const formatCurrency = (value?: number) => {
    if (value === undefined) return "—";
    return `$${value.toLocaleString("en-US")}`;
  };

  // Calculate cost savings
  const hasSavings =
    order.quotePrice !== undefined &&
    order.repairPrice !== undefined &&
    order.quotePrice > order.repairPrice;
  const savedAmount = hasSavings ? order.quotePrice! - order.repairPrice! : 0;

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: "You",
        text: newComment.trim(),
        createdAt: formatCommentDate(new Date()),
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="order-details-overlay" onClick={onClose} />

      {/* Panel */}
      <aside className="order-details-panel">
        {/* Header */}
        <div className="order-details-header">
          <div className="order-details-header-main">
            <h2 className="order-details-title">{order.id}</h2>
            <p className="order-details-meta">
              {order.segment} · {order.commodityType}
            </p>
            <div className="order-details-chips">
              <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {order.status}
              </span>
              <span className={`sla-pill sla-${order.slaStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                {order.slaStatus}
              </span>
            </div>
          </div>
          <button className="order-details-close" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="order-details-content">
          {/* Cost Savings Block */}
          <div className={`order-details-savings-block ${!hasSavings ? "order-details-savings-block--muted" : ""}`}>
            <div className="order-details-savings-label">COST SAVINGS</div>
            {hasSavings ? (
              <>
                <div className="order-details-savings-amount">{formatCurrency(savedAmount)}</div>
                <div className="order-details-savings-subtitle">vs. quoted price</div>
              </>
            ) : (
              <div className="order-details-savings-subtitle">Savings data not available.</div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="order-progress-bar-section">
            <OrderProgressBar stage={orderStage} />
          </div>

          {/* Details Section */}
          <section className="order-details-section">
            <h3 className="order-details-section-title">Details</h3>
            <div className="order-details-grid">
              <div className="order-details-grid-item">
                <span className="order-details-label">MR #</span>
                <span className="order-details-value">{order.id}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Segment</span>
                <span className="order-details-value">{order.segment}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Repair Type</span>
                <span className="order-details-value">{order.repairType}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Commodity Type</span>
                <span className="order-details-value">{order.commodityType}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">MARS Part #</span>
                <span className="order-details-value">{order.marsPart}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Subsidiary</span>
                <span className="order-details-value">{order.siteName}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Customer PO #</span>
                <span className="order-details-value">{order.customerPoNumber}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Quantity</span>
                <span className="order-details-value">{order.qty}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Repair Price</span>
                <span className="order-details-value">{formatCurrency(order.repairPrice)}</span>
              </div>
              <div className="order-details-grid-item">
                <span className="order-details-label">Quote Price</span>
                <span className="order-details-value">{formatCurrency(order.quotePrice)}</span>
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <section className="order-details-section">
            <h3 className="order-details-section-title">Comments</h3>
            <div className="order-comments-container">
              <div className="order-comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="order-comment-item">
                    <div className="order-comment-header">
                      <div className="order-comment-author">{comment.author}</div>
                      <div className="order-comment-date">{comment.createdAt}</div>
                    </div>
                    <div className="order-comment-text">{comment.text}</div>
                  </div>
                ))}
              </div>
              <div className="order-comment-input-section">
                <textarea
                  className="order-comment-textarea"
                  placeholder="Add a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <button
                  className="order-comment-submit-button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
