import { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';

const ProductModal = ({ product, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        im_code: '',
        status: 'Stock',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        sale_price: '',
        sale_date: '',
        service_date: '',
        barcode: '',
        storage: '',
        ram: '',
        sponsor_name: '',
        buyer_name: '',
        exchange_details: '',
        description: '',
        purchase_source: 'Shop' // Shop, Online, Others
    });
    const [showScanner, setShowScanner] = useState(false);
    const [viewMode, setViewMode] = useState('DETAILS'); // DETAILS, SELL_INPUT, SELL_PREVIEW, SOLD_DETAILS

    useEffect(() => {
        if (product) {
            const dateObj = new Date(product.date || Date.now());
            setFormData({
                ...product,
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                sale_date: product.sale_date ? product.sale_date.slice(0, 16) : '',
                service_date: product.service_date ? product.service_date.split('T')[0] : '',
                purchase_source: product.purchase_source || 'Shop'
            });

            setViewMode('DETAILS');
        } else {
            setFormData({
                name: '', im_code: '', status: 'Stock',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                sale_price: '', sale_date: '', service_date: '', barcode: '',
                storage: '', ram: '', sponsor_name: '', buyer_name: '', exchange_details: '', description: '',
                purchase_source: 'Shop'
            });
            setViewMode('DETAILS');
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelection = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const combinedDate = new Date(`${formData.date}T${formData.time}`);
        onSave({ ...formData, date: combinedDate.toISOString() });
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
        const combinedDate = new Date(`${formData.date}T${formData.time}`);
        await onSave({ ...formData, date: combinedDate.toISOString() });
        window.print();
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            if (onDelete) await onDelete(product.id);
        }
    };

    // Options for Chips
    const storageOptions = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
    const ramOptions = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
    const sourceOptions = ['Shop', 'Online', 'Others'];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in sm:p-4">
            <div className="w-full max-w-xl bg-[#000000] sm:rounded-[32px] rounded-t-[32px] p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#000000] z-10 py-2">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 className="text-xl font-semibold text-[var(--text-rgb-25-81-255)]">
                            {viewMode === 'DETAILS' ? (product?.id ? 'Edit Product' : 'Add Product') :
                                viewMode === 'SELL_INPUT' ? 'Sale Details' :
                                    viewMode === 'SELL_PREVIEW' ? 'Bill Preview' : 'Sold Product'}
                        </h2>
                    </div>
                </div>

                {/* --- STEP 1: DETAILS (Add/Edit Form) --- */}
                {viewMode === 'DETAILS' && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Mobile Name */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Mobile</label>
                            <input
                                name="name"
                                placeholder="Enter Mobile Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                            />
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Status</label>
                            <div className="flex flex-wrap gap-3">
                                {['Stock', 'Sales', 'Service'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleSelection('status', opt)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.status === opt
                                            ? 'bg-white text-black'
                                            : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Storage Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Select Storage</label>
                            <div className="flex flex-wrap gap-3">
                                {storageOptions.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleSelection('storage', opt)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.storage === opt
                                            ? 'bg-white text-black'
                                            : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                            }`}
                                    >
                                        {opt.replace('GB', '')}
                                    </button>
                                ))}
                                <input
                                    name="storage"
                                    placeholder="Custom"
                                    value={formData.storage}
                                    onChange={handleChange}
                                    className="w-20 bg-[#121212] border border-[#333] rounded-xl px-2 py-2 text-white text-sm text-center placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                        </div>

                        {/* RAM Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Select RAM</label>
                            <div className="flex flex-wrap gap-3">
                                {ramOptions.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleSelection('ram', opt)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.ram === opt
                                            ? 'bg-white text-black'
                                            : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                            }`}
                                    >
                                        {opt.replace('GB', '')}
                                    </button>
                                ))}
                                <input
                                    name="ram"
                                    placeholder="Custom"
                                    value={formData.ram}
                                    onChange={handleChange}
                                    className="w-20 bg-[#121212] border border-[#333] rounded-xl px-2 py-2 text-white text-sm text-center placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                        </div>

                        {/* IM Code & Sponsor */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">IM Code</label>
                                <input
                                    name="im_code"
                                    placeholder="Enter IM"
                                    value={formData.im_code}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">Sponsor</label>
                                <input
                                    name="sponsor_name"
                                    placeholder="Enter Name"
                                    value={formData.sponsor_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                />
                            </div>
                        </div>

                        {/* Barcode */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Barcode</label>
                            <div className="relative">
                                <input
                                    name="barcode"
                                    placeholder="Scan or Enter Barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-lg hover:bg-white/20"
                                >
                                    📷
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Description</label>
                            <textarea
                                name="description"
                                placeholder="Enter About The Product"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none resize-none"
                            />
                        </div>

                        {/* Sales Details (Visible if Sales or Sold) */}
                        {(formData.status === 'Sales' || formData.status === 'Sold') && (
                            <div className="space-y-4 border-t border-white/10 pt-4 mt-2">
                                <h3 className="text-[var(--text-rgb-25-81-255)] font-semibold">Sales Details</h3>

                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-rgb-117-117-117)]">Buyer Name</label>
                                    <input
                                        name="buyer_name"
                                        placeholder="Enter Buyer Name"
                                        value={formData.buyer_name || ''}
                                        onChange={handleChange}
                                        className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-rgb-200-211-79)]">Sold Price</label>
                                    <input
                                        type="text"
                                        name="sale_price"
                                        placeholder="0.00"
                                        value={formData.sale_price || ''}
                                        onChange={handleChange}
                                        className="w-full bg-[#121212] border border-[var(--text-rgb-200-211-79)] rounded-xl px-4 py-4 text-white text-xl font-bold placeholder-[var(--text-rgb-54-65-82)] focus:ring-1 focus:ring-[var(--text-rgb-200-211-79)] outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-rgb-117-117-117)]">Purchase From</label>
                                    <div className="flex flex-wrap gap-3">
                                        {sourceOptions.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => handleSelection('purchase_source', opt)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.purchase_source === opt
                                                    ? 'bg-white text-black'
                                                    : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-rgb-117-117-117)]">Exchange Details</label>
                                    <textarea
                                        name="exchange_details"
                                        placeholder="Device Name, Condition, Price..."
                                        value={formData.exchange_details || ''}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-[#1E1E1E] text-white font-medium py-4 rounded-xl border border-[#333] hover:bg-[#2A2A2A] transition-colors"
                            >
                                Cancel
                            </button>

                            {product?.id && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500/10 text-red-500 font-medium py-4 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    Delete
                                </button>
                            )}

                            {(formData.status === 'Sales' || formData.status === 'Sold') && (
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
                                >
                                    Print Bill
                                </button>
                            )}

                            {product?.id && formData.status !== 'Sales' && formData.status !== 'Sold' && (
                                <button
                                    type="button"
                                    onClick={handleSellClick}
                                    className="flex-1 bg-[var(--text-rgb-200-211-79)] text-black font-bold py-4 rounded-xl hover:opacity-90 transition-colors"
                                >
                                    Sold
                                </button>
                            )}

                            <button
                                type="submit"
                                className="flex-[2] bg-[var(--text-rgb-25-81-255)] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
                            >
                                {product?.id ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                )}

                {/* --- STEP 2: SALES INPUT (Buyer Details) --- */}
                {viewMode === 'SELL_INPUT' && (
                    <form onSubmit={handleContinueToPreview} className="flex flex-col gap-6">
                        <div className="bg-[#121212] border border-[#333] rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-bold">{formData.name}</h3>
                                <p className="text-xs text-[var(--text-rgb-117-117-117)]">{formData.ram} • {formData.storage}</p>
                            </div>
                            <span className="text-[var(--text-rgb-25-81-255)] font-bold">${formData.sale_price || '0.00'}</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Buyer Name</label>
                            <input
                                name="buyer_name"
                                placeholder="Enter Buyer Name"
                                value={formData.buyer_name || ''}
                                onChange={handleChange}
                                required
                                autoFocus
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-200-211-79)]">Sold Price</label>
                            <input
                                type="number"
                                name="sale_price"
                                placeholder="0.00"
                                value={formData.sale_price}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#121212] border border-[var(--text-rgb-200-211-79)] rounded-xl px-4 py-4 text-white text-xl font-bold placeholder-[var(--text-rgb-54-65-82)] focus:ring-1 focus:ring-[var(--text-rgb-200-211-79)] outline-none"
                            />
                        </div>

                        {/* Purchase Source */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Purchase From</label>
                            <div className="flex flex-wrap gap-3">
                                {sourceOptions.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleSelection('purchase_source', opt)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.purchase_source === opt
                                            ? 'bg-white text-black'
                                            : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Exchange Details (Optional)</label>
                            <textarea
                                name="exchange_details"
                                placeholder="Device Name, Condition, Price..."
                                value={formData.exchange_details || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white placeholder-[var(--text-rgb-54-65-82)] focus:border-[var(--text-rgb-25-81-255)] outline-none resize-none"
                            />
                        </div>

                        <div className="flex gap-4 pt-4 mt-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('DETAILS')}
                                className="flex-1 bg-[#1E1E1E] text-white font-medium py-4 rounded-xl border border-[#333] hover:bg-[#2A2A2A] transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] bg-[var(--text-rgb-25-81-255)] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
                            >
                                Continue
                            </button>
                        </div>
                    </form>
                )}

                {/* --- STEP 3: PREVIEW & PRINT --- */}
                {viewMode === 'SELL_PREVIEW' && (
                    <div className="flex flex-col gap-6 h-full">
                        <div className="bg-white text-black rounded-xl shadow-lg overflow-y-auto max-h-[60vh] text-sm a4-2-1">
                            {/* Refonic 92 HTML Structure */}
                            <div className="frame-37280-2">
                                <div className="frame-37282-3">
                                    <div className="frame-37256-4">
                                        <div className="frame-37073-5">
                                            <p className="text-6"><span className="text-rgb-25-81-255">Refonic 92</span></p>
                                        </div>
                                    </div>
                                    <p className="text-7"><span className="text-black">+91 72999 85211</span></p>
                                </div>
                                <p className="text-8"><span className="text-black">Hi {formData.buyer_name || 'Customer'},</span></p>
                                <div className="frame-37281-9">
                                    <p className="text-10"><span className="text-black">Thank you for your purchase! We appreciate your business and hope you had a great experience.</span></p>
                                    <p className="text-11"><span className="text-black">Address : </span><span className="text-rgb-81-81-81">92, Annai Sathya Bazaar, Postal Colony, T. Nagar, Chennai, Tamil Nadu 600017</span></p>
                                </div>
                                <div className="frame-37273-12">
                                    <div className="frame-37272-13">
                                        <div className="frame-37270-14">
                                            <p className="text-15"><span className="text-rgb-69-69-69">Mobile Name</span></p>
                                        </div>
                                        <div className="frame-37271-16">
                                            <p className="text-17"><span className="text-black">{formData.name}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37273-18">
                                        <div className="frame-37270-19">
                                            <p className="text-20"><span className="text-rgb-69-69-69">Storage ROM</span></p>
                                        </div>
                                        <div className="frame-37271-21">
                                            <p className="text-22"><span className="text-black">{formData.storage}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37274-23">
                                        <div className="frame-37270-24">
                                            <p className="text-25"><span className="text-rgb-69-69-69">RAM</span></p>
                                        </div>
                                        <div className="frame-37271-26">
                                            <p className="text-27"><span className="text-black">{formData.ram}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37278-28">
                                        <div className="frame-37270-29">
                                            <p className="text-30"><span className="text-rgb-69-69-69">Date</span></p>
                                        </div>
                                        <div className="frame-37271-31">
                                            <p className="text-32"><span className="text-black">{new Date().toLocaleDateString('en-GB')}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37279-33">
                                        <div className="frame-37270-34">
                                            <p className="text-35"><span className="text-rgb-69-69-69">Time</span></p>
                                        </div>
                                        <div className="frame-37271-36">
                                            <p className="text-37"><span className="text-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37275-38">
                                        <div className="frame-37270-39">
                                            <p className="text-40"><span className="text-rgb-69-69-69">Purchase from</span></p>
                                        </div>
                                        <div className="frame-37271-41">
                                            <p className="text-42"><span className="text-black">{formData.purchase_source}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37276-43">
                                        <div className="frame-37270-44">
                                            <p className="text-45"><span className="text-rgb-69-69-69">Barcode ID</span></p>
                                        </div>
                                        <div className="frame-37271-46">
                                            <p className="text-47"><span className="text-black">{formData.barcode || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                    <div className="frame-37277-48">
                                        <div className="frame-37270-49">
                                            <p className="text-50"><span className="text-rgb-69-69-69">Price</span></p>
                                        </div>
                                        <div className="frame-37271-51">
                                            <p className="text-52"><span className="text-black">{formData.sale_price}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 mt-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('SELL_INPUT')}
                                className="flex-1 bg-[#1E1E1E] text-white font-medium py-4 rounded-xl border border-[#333] hover:bg-[#2A2A2A] transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-[#1E1E1E] text-white font-medium py-4 rounded-xl border border-[#333] hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📥</span> Save PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex-[2] bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>🖨️</span> Print Receipt
                            </button>
                        </div>

                        {/* Refonic 92 CSS */}
                        <style>{`
                            @import url('https://fonts.googleapis.com/css?family=Poppins&display=swap');
                            @font-face {
                                font-family: 'Quando';
                                src: url('https://fonts.gstatic.com/s/quando/v10/46k2lbT3XjDSF0R1.woff2') format('woff2');
                            }
                            
                            :root {
                                --font-family-quando: 'Quando', serif;
                                --font-family-poppins: 'Poppins', sans-serif;
                                --text-rgb-25-81-255: rgba(25, 81, 255, 1);
                                --text-black: rgba(0, 0, 0, 1);
                                --text-rgb-81-81-81: rgba(81, 81, 81, 1);
                                --text-rgb-69-69-69: rgba(69, 69, 69, 1);
                            }

                            .text-rgb-25-81-255 { color: var(--text-rgb-25-81-255); }
                            .text-black { color: var(--text-black); }
                            .text-rgb-81-81-81 { color: var(--text-rgb-81-81-81); }
                            .text-rgb-69-69-69 { color: var(--text-rgb-69-69-69); }

                            .a4-2-1 {
                                background-color: white;
                                padding: 20px;
                                width: 100%;
                                max-width: 210mm; /* A4 width */
                                margin: 0 auto;
                            }

                            .frame-37280-2 {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 20px;
                                width: 100%;
                            }

                            .frame-37282-3 {
                                display: flex;
                                justify-content: space-between; /* Changed to space-between for header layout */
                                align-items: center;
                                width: 100%;
                                position: relative;
                            }
                            
                            /* Centering the Logo */
                            .frame-37256-4 {
                                position: absolute;
                                left: 50%;
                                transform: translateX(-50%);
                            }

                            .text-6 {
                                font-family: var(--font-family-quando);
                                font-size: 24px; /* Increased slightly */
                                color: var(--text-rgb-25-81-255);
                                text-align: center;
                            }

                            .text-7 {
                                font-family: var(--font-family-poppins);
                                font-size: 12px;
                                color: var(--text-black);
                                margin-left: auto; /* Pushes to right */
                            }

                            .text-8 {
                                font-family: var(--font-family-poppins);
                                font-weight: 600; /* Bold */
                                font-size: 32px; /* Large greeting */
                                color: var(--text-black);
                                margin-top: 20px;
                            }

                            .frame-37281-9 {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 4px;
                                text-align: center;
                            }

                            .text-10 {
                                font-family: var(--font-family-poppins);
                                font-weight: 500;
                                font-size: 14px;
                                color: var(--text-black);
                                max-width: 80%;
                            }

                            .text-11 {
                                font-family: var(--font-family-poppins);
                                font-size: 10px;
                                color: var(--text-rgb-81-81-81);
                                max-width: 80%;
                            }

                            .frame-37273-12 {
                                display: flex;
                                flex-direction: column;
                                gap: 15px;
                                width: 100%;
                                margin-top: 30px;
                            }

                            /* Row Styles */
                            .frame-37272-13, .frame-37273-18, .frame-37274-23, .frame-37278-28, 
                            .frame-37279-33, .frame-37275-38, .frame-37276-43, .frame-37277-48 {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                width: 100%;
                                padding: 0 20px; /* Add padding to align with design */
                            }

                            /* Label Column */
                            .frame-37270-14, .frame-37270-19, .frame-37270-24, .frame-37270-29,
                            .frame-37270-34, .frame-37270-39, .frame-37270-44, .frame-37270-49 {
                                width: 40%;
                                text-align: left;
                            }

                            /* Value Column */
                            .frame-37271-16, .frame-37271-21, .frame-37271-26, .frame-37271-31,
                            .frame-37271-36, .frame-37271-41, .frame-37271-46, .frame-37271-51 {
                                width: 60%;
                                text-align: left; /* Values left aligned as per image */
                            }

                            .text-15, .text-20, .text-25, .text-30, .text-35, .text-40, .text-45, .text-50 {
                                font-family: var(--font-family-poppins);
                                font-weight: 500;
                                font-size: 14px;
                                color: var(--text-rgb-69-69-69);
                            }

                            .text-17, .text-22, .text-27, .text-32, .text-37, .text-42, .text-47, .text-52 {
                                font-family: var(--font-family-poppins);
                                font-weight: 600;
                                font-size: 14px;
                                color: var(--text-black);
                            }

                            /* Print Specifics */
                            @media print {
                                body * { visibility: hidden; }
                                .fixed.inset-0 { 
                                    position: absolute; 
                                    inset: 0; 
                                    background: white; 
                                    padding: 0; 
                                    display: block; 
                                    z-index: 9999;
                                }
                                .fixed.inset-0 .bg-white { 
                                    box-shadow: none; 
                                    max-height: none; 
                                    overflow: visible; 
                                    width: 100%;
                                    max-width: none;
                                }
                                .a4-2-1, .a4-2-1 * { visibility: visible; }
                                .a4-2-1 {
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    padding: 40px; /* Print padding */
                                }
                                button { display: none !important; }
                            }
                        `}</style>
                    </div>
                )}

                {/* --- STEP 4: SOLD DETAILS (View Only) --- */}
                {viewMode === 'SOLD_DETAILS' && (
                    <div className="flex flex-col gap-6">
                        {/* Product Info */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Mobile</label>
                            <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white">
                                {formData.name}
                            </div>
                        </div>

                        {/* Buyer Info */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Buyer Name</label>
                            <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white">
                                {formData.buyer_name}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">Date</label>
                                <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white">
                                    {formData.date}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-rgb-117-117-117)]">Time</label>
                                <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white">
                                    {formData.time}
                                </div>
                            </div>
                        </div>

                        {/* Sold Price */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Sold Price</label>
                            <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white font-bold text-xl">
                                ${formData.sale_price}
                            </div>
                        </div>

                        {/* Purchase Source */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Purchase From</label>
                            <div className="flex flex-wrap gap-3">
                                {sourceOptions.map(opt => (
                                    <div
                                        key={opt}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium ${formData.purchase_source === opt
                                            ? 'bg-white text-black'
                                            : 'bg-[#121212] text-[var(--text-rgb-54-65-82)] border border-[#333]'
                                            }`}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-rgb-117-117-117)]">Description</label>
                            <div className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-4 text-white min-h-[80px]">
                                {formData.description}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 mt-auto overflow-x-auto pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 min-w-[100px] bg-[#1E1E1E] text-white font-medium py-4 rounded-xl border border-[#333] hover:bg-[#2A2A2A] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 min-w-[100px] bg-red-500/10 text-red-500 font-medium py-4 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="flex-[1.5] min-w-[120px] bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Print Bill
                            </button>
                        </div>
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
