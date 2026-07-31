import { useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  brand: "",
  price: 0,
  discountPercentage: 0,
  rating: 0,
  stock: 0,
  thumbnail: "",
};

const CATEGORIES = [
  "electronics",
  "clothing",
  "footwear",
  "accessories",
  "home",
  "beauty",
  "sports",
  "toys",
  "groceries",
  "other",
];

const BRANDS = [
  "Aurora",
  "TerraFlask",
  "Keytron",
  "Basicwear",
  "Brewmaster",
  "Pathfinder",
  "Craftline",
  "Generic",
  "Other",
];

export default function ProductForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialData });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Title *
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </label>

        <div className="form-grid">
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <select name="brand" value={form.brand} onChange={handleChange}>
              <option value="">Select brand…</option>
              {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
              ))}
            </select>
          </label>
          <label>
            Price ($)
            <input type="number" name="price" value={form.price} onChange={handleChange} min={0} step="0.01" />
          </label>
          <label>
            Discount (%)
            <input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                min={0}
                max={100}
            />
          </label>
          <label>
            Rating
            <input type="number" name="rating" value={form.rating} onChange={handleChange} min={0} max={5} step="0.1" />
          </label>
          <label>
            Stock
            <input type="number" name="stock" value={form.stock} onChange={handleChange} min={0} />
          </label>
        </div>

        <label>
          Thumbnail URL
          <input name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="https://…" />
        </label>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
  );
}