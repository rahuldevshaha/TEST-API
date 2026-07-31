import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct, useDeleteProduct } from "../hooks/useProducts.js";
import ConfirmDialog from "./ConfirmDialog.jsx";


const KNOWN_FIELDS = [
  "id",
  "title",
  "description",
  "category",
  "brand",
  "price",
  "discountPercentage",
  "rating",
  "stock",
  "thumbnail",
  "images",
  "createdAt",
];

const formatLabel = (key) =>
    key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? `${value.length} item(s)` : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error } = useProduct(id);
  const deleteMutation = useDeleteProduct();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <div className="page state-msg">Loading product…</div>;
  if (isError) return <div className="page state-msg error">Failed to load: {error.message}</div>;
  if (!product) return null;

  const handleDelete = () => setConfirmOpen(true);

  const handleConfirmDelete = () => {
    deleteMutation.mutate(product.id, { onSuccess: () => navigate("/") });
  };

  const createdAtDisplay = product.createdAt ? new Date(product.createdAt).toLocaleString() : "—";

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  const extraFields = Object.entries(product).filter(([key]) => !KNOWN_FIELDS.includes(key));

  return (
      <div className="page detail-page">
        <Link to="/" className="back-link">
          ← Back to all products
        </Link>

        <div className="detail-card">
          <img src={product.thumbnail || "https://placehold.co/300x300?text=%20"} alt={product.title} />
          <div className="detail-info">
            <h1>{product.title}</h1>
            <div className="product-meta">
              <span className="tag">{product.category || "uncategorized"}</span>
              <span className="tag muted">{product.brand || "—"}</span>
            </div>
            <p className="description">{product.description || "No description provided."}</p>

            <div className="detail-stats">
              <div>
                <span className="stat-label">Price</span>
                <strong>${Number(product.price ?? 0).toFixed(2)}</strong>
              </div>
              <div>
                <span className="stat-label">Discount</span>
                <strong>{product.discountPercentage ?? 0}%</strong>
              </div>
              <div>
                <span className="stat-label">Rating</span>
                <strong>{product.rating ?? 0} / 5</strong>
              </div>
              <div>
                <span className="stat-label">Stock</span>
                <strong>{product.stock ?? 0}</strong>
              </div>
              <div>
                <span className="stat-label">Product ID</span>
                <strong>{product.id}</strong>
              </div>
              <div>
                <span className="stat-label">Created</span>
                <strong>{createdAtDisplay}</strong>
              </div>
            </div>

            {images.length > 0 && (
                <div className="detail-section">
                  <span className="stat-label detail-section-label">Gallery ({images.length})</span>
                  <div className="gallery-grid">
                    {images.map((src, i) => (
                        <img key={i} src={src} alt={`${product.title} ${i + 1}`} />
                    ))}
                  </div>
                </div>
            )}

            {extraFields.length > 0 && (
                <div className="detail-section">
                  <span className="stat-label detail-section-label">Additional details</span>
                  <div className="detail-stats compact">
                    {extraFields.map(([key, value]) => (
                        <div key={key}>
                          <span className="stat-label">{formatLabel(key)}</span>
                          <strong>{formatValue(value)}</strong>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            <button className="btn danger" onClick={handleDelete}>
              Delete product
            </button>
          </div>
        </div>

        <ConfirmDialog
            open={confirmOpen}
            title="Confirm deletion"
            message="Are you sure you want to delete this product? This action cannot be undone."
            confirmLabel="Delete"
            busy={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmOpen(false)}
        />
      </div>
  );
}