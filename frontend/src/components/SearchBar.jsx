import { useState, useEffect } from "react";

export default function SearchBar({ value, onChange }) {
    const [local, setLocal] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => onChange(local), 350);
        return () => clearTimeout(t);
    }, [local]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input
                type="text"
                placeholder="Search by title, brand, or category…"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
            />
            {local && (
                <button className="icon-btn" onClick={() => setLocal("")} aria-label="Clear search">
                    ✕
                </button>
            )}
        </div>
    );
}