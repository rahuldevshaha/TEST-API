import { useState, useEffect } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useDeleteSelectedProducts,
} from "../hooks/useProducts";
import SearchBar from "./SearchBar";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import Pagination from "./Pagination";

const LIMIT = 12;

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null
  const [editingProduct, setEditingProduct] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useProducts({ search, page, limit: LIMIT });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const deleteSelectedMutation = useDeleteSelectedProducts();

  const products = Array.isArray(data?.items) ? data.items : [];
  const total = typeof data?.total === "number" ? data.total : products.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const allOnPageSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));
  const bulkDeleteBusy = deleteSelectedMutation.isPending;


  useEffect(() => {
    if (!isLoading && !isFetching && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, isLoading, isFetching]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = products.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
        allSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
    );
  };

  const handleCreate = (formData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setModalMode(null),
    });
  };

  const handleUpdate = (formData) => {
    updateMutation.mutate(
        { id: editingProduct.id, payload: formData },
        { onSuccess: () => setModalMode(null) }
    );
  };


  const [confirmAction, setConfirmAction] = useState(null); // { type: "one" | "selected", id? }

  const handleDeleteOne = (id) => {
    setConfirmAction({ type: "one", id });
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    setConfirmAction({ type: "selected" });
  };

  const closeConfirm = () => setConfirmAction(null);

  const handleConfirmDelete = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "one") {
      deleteMutation.mutate(confirmAction.id, { onSuccess: closeConfirm });
    } else if (confirmAction.type === "selected") {
      const idsToDelete = selectedIds;
      deleteSelectedMutation.mutate(idsToDelete, {
        onSuccess: (result) => {
          const failedIds = result?.failedIds || [];
          setSelectedIds(failedIds);
          closeConfirm();
          if (failedIds.length) {
            alert(
                `${result.deletedCount} of ${idsToDelete.length} product(s) deleted. ` +
                `${failedIds.length} couldn't be deleted after retrying - they're still selected, try again.`
            );
          }
        },
      });
    }
  };

  const confirmDeleteBusy = deleteMutation.isPending || bulkDeleteBusy;

  const confirmDeleteMessage = confirmAction
      ? {
        one: "Are you sure you want to delete this product? This action cannot be undone.",
        selected: `Delete ${selectedIds.length} selected product(s)? This action cannot be undone.`,
      }[confirmAction.type]
      : "";

  const goToPage = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPage(clamped);
  };

  return (
      <div className="product-list">
        <div className="toolbar">
          <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
          />
          <div className="toolbar-actions">
            {selectedIds.length > 0 && (
                <button className="btn danger" onClick={handleDeleteSelected} disabled={bulkDeleteBusy}>
                  {bulkDeleteBusy ? "Deleting…" : `Delete selected (${selectedIds.length})`}
                </button>
            )}
            <button
                className="btn primary"
                onClick={() => {
                  setEditingProduct(null);
                  setModalMode("create");
                }}
            >
              + New product
            </button>
          </div>
        </div>

        <div className="list-meta">
          <label className="select-all">
            <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={toggleSelectAllOnPage}
                disabled={bulkDeleteBusy}
            />
            {allOnPageSelected ? "Deselect all" : "Select all on page"}
          </label>
          <span>
          {total} product{total !== 1 ? "s" : ""} {isFetching && !isLoading ? "· refreshing…" : ""}
        </span>
        </div>

        {isLoading && <div className="state-msg">Loading products…</div>}
        {isError && <div className="state-msg error">Failed to load: {error.message}</div>}
        {bulkDeleteBusy && (
            <div className="state-msg">Deleting {selectedIds.length} product(s)…</div>
        )}
        {!isLoading && !isError && products.length === 0 && (
            <div className="state-msg">No products found{search ? ` for "${search}"` : ""}.</div>
        )}

        <div className="product-grid" aria-busy={bulkDeleteBusy} style={bulkDeleteBusy ? { opacity: 0.6, pointerEvents: "none" } : undefined}>
          {products.length > 0 && (
              <div className="product-grid-header" aria-hidden="true">
                <span />
                <span />
                <span className="col-name">Product</span>
                <span className="col-price">Price</span>
                <span className="col-stock">Stock</span>
                <span className="col-actions">Actions</span>
              </div>
          )}
          {products.map((product) => (
              <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedIds.includes(product.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setModalMode("edit");
                  }}
                  onDelete={handleDeleteOne}
              />
          ))}
        </div>

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}

        {modalMode && (
            <Modal title={modalMode === "create" ? "New product" : "Edit product"} onClose={() => setModalMode(null)}>
              <ProductForm
                  initialData={modalMode === "edit" ? editingProduct : undefined}
                  onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
                  onCancel={() => setModalMode(null)}
                  submitting={createMutation.isPending || updateMutation.isPending}
              />
            </Modal>
        )}

        <ConfirmDialog
            open={!!confirmAction}
            title="Confirm deletion"
            message={confirmDeleteMessage}
            confirmLabel="Delete"
            busy={confirmDeleteBusy}
            onConfirm={handleConfirmDelete}
            onCancel={closeConfirm}
        />
      </div>
  );
}