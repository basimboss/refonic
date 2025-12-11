import { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import BarcodeScanner from './BarcodeScanner';

const Dashboard = ({ onLogout }) => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const fetchProducts = async () => {
        try {
            const query = new URLSearchParams({ status: filter, search: searchTerm }).toString();
            const res = await fetch(`/api/products?${query}`);
            const data = await res.json();
            setProducts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [filter, searchTerm]);

    const handleSave = async (productData) => {
        try {
            const url = editingProduct
                ? `/api/products/${editingProduct.id}`
                : '/api/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingProduct(null);
                fetchProducts();
            }
        } catch (err) {
            console.error("Error saving product", err);
        }
    };

    const handleScanResult = async (barcode) => {
        setShowScanner(false);
        try {
            const res = await fetch(`/api/products/scan/${barcode}`);
            const data = await res.json();
            if (res.ok && data.data) {
                setEditingProduct(data.data);
                setIsModalOpen(true);
            } else {
                // If not found, open add modal with barcode pre-filled
                setEditingProduct({ barcode, status: 'Stock' }); // Partial pre-fill
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error("Error scanning product", err);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="gradient-text text-3xl">Refonic</h1>
                        <p className="text-sm opacity-70">Mobile Inventory</p>
                    </div>
                    <button onClick={onLogout} className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                        Logout
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Search Mobile, Barcode, Sponsor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {['All', 'Stock', 'Sales', 'Service'].map(f => {
                        const count = products.filter(p => f === 'All' ? true : p.status === f).length;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${filter === f
                                    ? 'bg-white text-black shadow-lg'
                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                    }`}
                            >
                                {f}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-black/10' : 'bg-white/10'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product List */}
            <div className="p-4 pb-24">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className={`card status-${product.status}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg text-white font-bold">{product.name}</h3>
                                {(product.storage || product.ram) && (
                                    <p className="text-xs text-gray-400">
                                        {product.ram && `${product.ram} RAM`}
                                        {product.ram && product.storage && ' | '}
                                        {product.storage && `${product.storage} Storage`}
                                    </p>
                                )}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${product.status === 'Stock' ? 'bg-green-500/20 text-green-400' :
                                product.status === 'Sales' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-orange-500/20 text-orange-400'
                                }`}>
                                {product.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-end mt-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">
                                    {product.sponsor_name && <span className="text-blue-400 mr-2">@{product.sponsor_name}</span>}
                                    {product.im_code}
                                </p>
                                <p className="text-xs text-gray-600">{product.barcode}</p>
                            </div>

                            <div className="text-right">
                                {product.status === 'Sales' ? (
                                    <>
                                        <p className="text-xs text-gray-500">Sold Price</p>
                                        <p className="text-xl font-bold text-blue-400">${product.sale_price}</p>
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-500">{product.date}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="text-center py-20 text-gray-600">
                        <p>No items found</p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <button className="nav-item active">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                    <span>Home</span>
                </button>

                <button
                    className="fab"
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>

                <button
                    className="nav-item"
                    onClick={() => setShowScanner(true)}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z" /></svg>
                    <span>Scan</span>
                </button>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {showScanner && (
                <BarcodeScanner
                    onScan={handleScanResult}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
