import { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import BillReceipt from './BillReceipt';

const ProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        im_code: '',
        status: 'Stock',
        date: new Date().toISOString().split('T')[0],
        sale_price: '',
        sale_date: '',
        service_date: '',
        barcode: '',
        storage: '',
        ram: '',
        sponsor_name: '',
        buyer_name: '',
        exchange_details: ''
    });
    const [showScanner, setShowScanner] = useState(false);
    const [viewMode, setViewMode] = useState('DETAILS'); // DETAILS, SELL_INPUT, SELL_PREVIEW

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                date: product.date ? product.date.split('T')[0] : new Date().toISOString().split('T')[0],
                sale_date: product.sale_date ? product.sale_date.slice(0, 16) : '',
                service_date: product.service_date ? product.service_date.split('T')[0] : ''
            });
            setViewMode('DETAILS');
        } else {
            setFormData({
                name: '', im_code: '', status: 'Stock', date: new Date().toISOString().split('T')[0],
                sale_price: '', sale_date: '', service_date: '', barcode: '',
                storage: '', ram: '', sponsor_name: '', buyer_name: '', exchange_details: ''
            });
            setViewMode('DETAILS');
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleSellClick = () => {
        setFormData(prev => ({
            ...prev,
            status: 'Sales',
            sale_date: new Date().toISOString().slice(0, 16)
        }));
        setViewMode('SELL_INPUT');
    };

    const handleContinueToPreview = (e) => {
        e.preventDefault();
        setViewMode('SELL_PREVIEW');
    };

    const handlePrint = async () => {
        await onSave(formData);
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#1E1E1E] rounded-2xl p-6 border border-white/10 shadow-2xl relative">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {viewMode === 'DETAILS' ? (product?.id ? 'Edit Mobile' : 'Add Mobile') :
                            viewMode === 'SELL_INPUT' ? 'Sale Details' :
                                'Bill Preview'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 p-2 hover:text-white bg-white/5 rounded-full">✕</button>
                </div>

                {/* --- STEP 1: DETAILS (Standard Add/Edit) --- */}
                {viewMode === 'DETAILS' && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Device Name */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Device Name</label>
                            <input
                                name="name"
                                placeholder="e.g. iPhone 13 Pro"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* RAM & Storage */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">RAM</label>
                                <input
                                    name="ram"
                                    list="ram-options"
                                    placeholder="8GB"
                                    value={formData.ram}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <datalist id="ram-options">
                                    {[2, 4, 8, 12, 16, 18, 24, 64].map(r => <option key={r} value={`${r}GB`} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Storage</label>
                                <input
                                    name="storage"
                                    list="storage-options"
                                    placeholder="128GB"
                                    value={formData.storage}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <datalist id="storage-options">
                                    {[32, 64, 128, 256, 512].map(s => <option key={s} value={`${s}GB`} />)}
                                </datalist>
                            </div>
                        </div>

                        {/* Sponsor & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Sponsor</label>
                                <input
                                    name="sponsor_name"
                                    placeholder="Name"
                                    value={formData.sponsor_name}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value="Stock">Stock</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Service">Service</option>
                                </select>
                            </div>
                        </div>

                        {/* IM & Barcode */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">IM / Description</label>
                            <input
                                name="im_code"
                                placeholder="IM Code"
                                value={formData.im_code}
                                onChange={handleChange}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Barcode</label>
                            <div className="flex gap-3">
                                <input
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    placeholder="Scan..."
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl transition-colors"
                                >
                                    📷
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-auto flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            {product?.id && formData.status !== 'Sales' && (
                                <button
                                    type="button"
                                    onClick={handleSellClick}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-green-900/20"
                                >
                                    Sell
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                            >
                                {product?.id ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </form>
                )}

                {/* --- STEP 2: SALES INPUT --- */}
                {viewMode === 'SELL_INPUT' && (
                    <form onSubmit={handleContinueToPreview} className="flex flex-col gap-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <h3 className="text-blue-400 font-bold mb-1">{formData.name}</h3>
                            <p className="text-xs text-gray-400">{formData.ram} • {formData.storage}</p>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Buyer Name</label>
                            <input
                                name="buyer_name"
                                placeholder="Enter Buyer Name"
                                value={formData.buyer_name || ''}
                                onChange={handleChange}
                                required
                                autoFocus
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-green-400 mb-2 uppercase tracking-wider font-bold">Selling Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                                <input
                                    type="number"
                                    name="sale_price"
                                    value={formData.sale_price}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/30 border border-green-500/30 rounded-xl px-4 py-4 pl-8 text-white focus:outline-none focus:border-green-500 text-xl font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Exchange Details (Optional)</label>
                            <textarea
                                name="exchange_details"
                                placeholder="Device Name, Condition, Price..."
                                value={formData.exchange_details || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="pt-4 mt-auto flex gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode('DETAILS')}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                            >
                                Continue
                            </button>
                        </div>
                    </form>
                )}

                {/* --- STEP 3: PREVIEW & PRINT --- */}
                {viewMode === 'SELL_PREVIEW' && (
                    <div className="flex flex-col gap-6 h-full">
                        <div className="bg-white text-black p-6 rounded-xl shadow-lg overflow-y-auto max-h-[50vh] text-sm">
                            <div className="text-center mb-6 border-b border-gray-200 pb-4">
                                <h1 className="text-2xl font-bold uppercase tracking-widest">Refonic</h1>
                                <p className="text-gray-500 text-xs mt-1">Mobile Inventory & Sales</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-bold">{new Date().toLocaleDateString()}</span>
                                </div>

                                {/* Editable Fields in Preview */}
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1">Buyer</label>
                                    <input
                                        name="buyer_name"
                                        value={formData.buyer_name}
                                        onChange={handleChange}
                                        className="w-full border-b border-gray-300 focus:border-black outline-none py-1 font-bold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1">Product</label>
                                    <div className="font-bold text-lg">{formData.name}</div>
                                    <div className="text-gray-500 text-xs">{formData.ram} | {formData.storage} | {formData.im_code}</div>
                                </div>

                                {formData.exchange_details && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="block text-xs text-gray-400 uppercase mb-1">Exchange</label>
                                        <textarea
                                            name="exchange_details"
                                            value={formData.exchange_details}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-none outline-none text-sm resize-none"
                                            rows="2"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t-2 border-black mt-4">
                                    <span className="text-lg font-bold">Total</span>
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold mr-1">$</span>
                                        <input
                                            name="sale_price"
                                            value={formData.sale_price}
                                            onChange={handleChange}
                                            className="w-24 text-right border-b border-gray-300 focus:border-black outline-none py-1 font-bold text-2xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 mt-auto flex gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode('SELL_INPUT')}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex-[2] bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>🖨️</span> Print / PDF
                            </button>
                        </div>

                        {/* Hidden Print Styles */}
                        <style>{`
                            @media print {
                                body * { visibility: hidden; }
                                .fixed.inset-0 { position: absolute; inset: 0; background: white; padding: 0; display: block; }
                                .fixed.inset-0 .bg-white { box-shadow: none; max-height: none; overflow: visible; }
                                .fixed.inset-0 .bg-white * { visibility: visible; }
                                button { display: none !important; }
                                input, textarea { border: none !important; }
                            }
                        `}</style>
                    </div>
                )}

                {showScanner && (
                    <BarcodeScanner
                        onScan={(code) => {
                            setFormData(prev => ({ ...prev, barcode: code }));
                            setShowScanner(false);
                        }}
                        onClose={() => setShowScanner(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductModal;
