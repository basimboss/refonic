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
                />
            )
}
        </div >
    );
};

export default ProductModal;
