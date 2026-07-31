import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./components/ProductDetail.jsx";

export default function App() {
    return (
        <div className="app-shell">
            <header className="app-header">
                <Link to="/" className="brand">
                    Test <span> Products</span> APIs
                </Link>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                </Routes>
            </main>
        </div>
    );
}