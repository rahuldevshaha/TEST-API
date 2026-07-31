import { Link } from "react-router-dom";

export default function ProductCard({ product, selected, onToggleSelect, onEdit, onDelete }) {
    return (
        <div className={`product-card ${selected ? "selected" : ""}`}>
            <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(product.id)}
                aria-label={`Select ${product.title}`}
            />

            <img
                src={product.thumbnail || "https://placehold.co/80x80?text=%20"}
                alt={product.title}
                loading="lazy"
            />

            <div className="product-info">
                <Link to={`/products/${product.id}`} className="product-title">
                    {product.title}
                </Link>
                <div className="product-meta">
                    <span className="tag">{product.category || "uncategorized"}</span>
                    <span className="tag muted">{product.brand || "—"}</span>
                </div>
            </div>

            <div className="product-price">
                <strong>${product.price?.toFixed(2)}</strong>
                {product.discountPercentage > 0 && (
                    <span className="discount">-{product.discountPercentage}%</span>
                )}
            </div>

            <div className="product-stock">
        <span className={product.stock > 0 ? "in-stock" : "out-stock"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
            </div>

            <div className="product-actions">
                <button className="icon-btn" onClick={() => onEdit(product)} title="Edit">
                    ✎
                </button>
                <button className="icon-btn danger" onClick={() => onDelete(product.id)} title="Delete">
                    🗑
                </button>
            </div>
        </div>
    );
}