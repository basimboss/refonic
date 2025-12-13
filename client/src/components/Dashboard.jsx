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
            const res = await fetch(`/api/products?${query}`, { cache: 'no-store' });
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
            } else {
                const errData = await res.json();
                alert(`Failed to save product: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error saving product", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setIsModalOpen(false);
                setEditingProduct(null);
                fetchProducts();
            } else {
                const errData = await res.json();
                alert(`Failed to delete product: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error deleting product", err);
            alert("Error deleting product. Please check your connection.");
        }
    };

    const handleScanResult = async (barcode) => {
        setShowScanner(false);
        const cleanBarcode = barcode.trim();
        try {
            const res = await fetch(`/api/products/scan/${cleanBarcode}`);
            const data = await res.json();
            if (res.ok && data.data) {
                setEditingProduct(data.data);
                setIsModalOpen(true);
            } else {
                setEditingProduct({ barcode, status: 'Stock' });
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error("Error scanning product", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#060912] font-[family-name:var(--font-family-poppins)] relative overflow-hidden pb-24">
            {/* Background Ellipses (Simulated with CSS) */}
            <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-[20%] right-[-50px] w-[200px] h-[200px] bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header */}
            <div className="p-6 flex justify-between items-center relative z-10">
                <h1 className="text-xl font-semibold text-white tracking-wide">Refonic Mobiles</h1>
                <button
                    onClick={onLogout}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/5"
                >
                    Logout
                </button>
            </div>

            {/* Search */}
            <div className="px-6 mb-6 relative z-10">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-rgb-199-199-199)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[var(--text-rgb-199-199-199)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none shadow-lg"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 mb-6 overflow-x-auto no-scrollbar relative z-10">
                <div className="flex gap-3">
                    {['All', 'Stock', 'Sales', 'Services'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f === 'Services' ? 'Service' : f)} // Map 'Services' to 'Service' status if needed
                            className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${(filter === f || (filter === 'Service' && f === 'Services'))
                                ? 'bg-white text-black shadow-lg scale-105'
                                : 'bg-[#1E1E1E] text-white border border-[#333] hover:bg-[#2A2A2A]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <p className="text-[var(--text-rgb-113-113-113)] text-xs mt-4 font-medium">
                    Total: {products.length}
                </p>
            </div>

            {/* Product List */}
            <div className="px-6 space-y-4 relative z-10">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="bg-[#1E1E1E] border border-[#333] rounded-[20px] p-5 active:scale-[0.98] transition-transform cursor-pointer shadow-lg relative overflow-hidden group"
                    >
                        {/* Status Indicator Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${product.status === 'Stock' ? 'bg-[var(--text-rgb-167-79-211)]' :
                            product.status === 'Sales' ? 'bg-[var(--text-rgb-200-211-79)]' :
                                'bg-[var(--text-rgb-211-79-79)]'
                            }`}></div>

                        <div className="flex justify-between items-start mb-3 pl-3">
                            <div>
                                <h3 className="text-[var(--text-rgb-113-113-113)] text-xs font-medium mb-1 uppercase tracking-wider">Mobile Name</h3>
                                <p className="text-white text-lg font-semibold">{product.name}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-[var(--text-rgb-113-113-113)] text-xs font-medium mb-1 uppercase tracking-wider">Status</h3>
                                <span className={`text-sm font-bold ${product.status === 'Stock' ? 'text-[var(--text-rgb-167-79-211)]' :
                                    product.status === 'Sales' ? 'text-[var(--text-rgb-200-211-79)]' :
                                        'text-[var(--text-rgb-211-79-79)]'
                                    }`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end pl-3">
                            <div>
                                <h3 className="text-[var(--text-rgb-113-113-113)] text-xs font-medium mb-1 uppercase tracking-wider">Date & Time</h3>
                                <p className="text-white text-sm">
                                    {new Date(product.date).toLocaleDateString()} & {new Date(product.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-[var(--text-rgb-113-113-113)] text-xs font-medium mb-1 uppercase tracking-wider">IM</h3>
                                <p className="text-white text-sm font-mono">{product.im_code}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="text-center py-10 text-[var(--text-rgb-113-113-113)]">
                        No products found
                    </div>
                )}
            </div>

            {/* Bottom Floating Action Buttons */}
            <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center gap-4 z-50">
                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl shadow-2xl hover:bg-white/20 transition-all active:scale-95"
                >
                    <div className="bg-white text-black p-1.5 rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <span className="font-medium">Add Product</span>
                </button>

                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl shadow-2xl hover:bg-white/20 transition-all active:scale-95"
                >
                    <div className="bg-white text-black p-1.5 rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                        </svg>
                    </div>
                    <span className="font-medium">Scan</span>
                </button>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
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
