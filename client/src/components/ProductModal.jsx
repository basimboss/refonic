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
        sale_date: new Date().toISOString().split('T')[0],
        service_date: new Date().toISOString().split('T')[0],
        barcode: '',
        storage: '',
        ram: '',
        sponsor_name: ''
    });
    const [showScanner, setShowScanner] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData(prev => ({ ...prev, ...product }));
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScan = (code) => {
        setFormData(prev => ({ ...prev, barcode: code }));
        setShowScanner(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleSell = async () => {
        // Update status to Sales and save, then show receipt
        const soldData = { ...formData, status: 'Sales', sale_date: new Date().toISOString().split('T')[0] };
        await onSave(soldData); // Save to DB first
        setFormData(soldData); // Update local state
        setShowReceipt(true);
    };

    if (showReceipt) {
        return <BillReceipt product={formData} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-[#1E1E1E] rounded-t-[24px] p-6 pb-8 h-[90vh] overflow-y-auto slide-up-panel border-t border-white/10">

                {/* Handle bar */}
                <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{product?.id ? 'Edit Mobile' : 'Add Mobile'}</h2>
                    <button onClick={onClose} className="text-gray-400 p-2 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Device Details</label>
                        <input
                            name="name"
                            placeholder="Mobile Name (e.g. iPhone 13)"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">RAM</label>
                            <div className="relative">
                                <input
                                    name="ram"
                                    list="ram-options"
                                    placeholder="e.g. 8GB"
                                    value={formData.ram}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <datalist id="ram-options">
                                    {[2, 4, 8, 12, 16, 18, 24, 64].map(r => <option key={r} value={`${r}GB`} />)}
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Storage</label>
                            <div className="relative">
                                <input
                                    name="storage"
                                    list="storage-options"
                                    placeholder="e.g. 128GB"
                                    value={formData.storage}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                />
                                <datalist id="storage-options">
                                    {[32, 64, 128, 256, 512].map(s => <option key={s} value={`${s}GB`} />)}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Sponsor Name</label>
                        <input
                            name="sponsor_name"
                            placeholder="Sponsor Name"
                            value={formData.sponsor_name}
                            onChange={handleChange}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
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
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                {formData.status === 'Sales' ? 'Sale Date' : 'Date'}
                            </label>
                            <input
                                type="date"
                                name={formData.status === 'Sales' ? 'sale_date' : formData.status === 'Service' ? 'service_date' : 'date'}
                                value={formData.status === 'Sales' ? formData.sale_date : formData.status === 'Service' ? formData.service_date : formData.date}
                                onChange={handleChange}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {formData.status === 'Sales' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs text-blue-400 mb-2 uppercase tracking-wider">Sale Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    name="sale_price"
                                    value={formData.sale_price}
                                    onChange={handleChange}
                                    className="w-full bg-black/30 border border-blue-500/50 rounded-xl px-4 py-3 pl-8 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">IM / Description</label>
                        <input
                            name="im_code"
                            placeholder="IM Code or Description"
                            value={formData.im_code}
                            onChange={handleChange}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Barcode</label>
                        <div className="flex gap-3">
                            <input
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                placeholder="Scan or type..."
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

                    <div className="pt-4 mt-auto flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        {product?.id && formData.status !== 'Sales' && (
                            <button
                                type="button"
                                onClick={handleSell}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Sell
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                        >
                            {product?.id ? 'Save' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default ProductModal;
