import { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';

const ProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        im_code: '',
        status: 'Stock',
        date: new Date().toISOString().split('T')[0],
        sale_price: '',
        sale_date: new Date().toISOString().split('T')[0],
        service_date: new Date().toISOString().split('T')[0],
        barcode: ''
    });
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        if (product) {
            // Merge default values with product data to ensure no fields are undefined
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

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-[#1E1E1E] rounded-t-[24px] p-6 pb-8 h-[85vh] overflow-y-auto slide-up-panel border-t border-white/10">

                {/* Handle bar for visual cue */}
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
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
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
                                    className="pl-8 border-blue-500/50 focus:border-blue-500"
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
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="btn btn-secondary px-4"
                            >
                                📷
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 mt-auto">
                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 text-lg"
                        >
                            {product?.id ? 'Save Changes' : 'Add to Inventory'}
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
