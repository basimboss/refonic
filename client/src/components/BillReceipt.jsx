import React from 'react';

const BillReceipt = ({ product, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white text-black w-full max-w-md rounded-xl overflow-hidden shadow-2xl">

                {/* Printable Area */}
                <div id="printable-area" className="p-8 bg-white">
                    <div className="text-center border-b-2 border-black pb-6 mb-6">
                        <h1 className="text-3xl font-bold tracking-wider uppercase mb-2">Refonic</h1>
                        <p className="text-sm text-gray-600">Mobile Sales & Service</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString()}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                            <span className="font-bold text-gray-600 text-sm uppercase">Item</span>
                            <span className="font-bold text-xl">{product.name}</span>
                        </div>

                        {(product.ram || product.storage) && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Specs</span>
                                <span>{product.ram} / {product.storage}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>IM / Serial</span>
                            <span className="font-mono">{product.im_code || '-'}</span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Sponsor</span>
                            <span>{product.sponsor_name || '-'}</span>
                        </div>

                        {product.buyer_name && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Buyer</span>
                                <span className="font-bold">{product.buyer_name}</span>
                            </div>
                        )}

                        {product.exchange_details && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Exchange</span>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.exchange_details}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center border-t-2 border-black pt-4 mb-8">
                        <span className="text-xl font-bold">TOTAL</span>
                        <span className="text-3xl font-bold">${product.sale_price}</span>
                    </div>

                    <div className="text-center text-xs text-gray-400">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">No returns without receipt.</p>
                    </div>
                </div>

                {/* Actions (Hidden when printing) */}
                <div className="bg-gray-100 p-4 flex gap-3 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 rounded-lg font-bold text-white bg-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print Receipt
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 20px;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BillReceipt;
