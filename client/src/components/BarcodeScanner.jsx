import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
      /* verbose= */ false
        );

        scanner.render((decodedText) => {
            onScan(decodedText);
            scanner.clear();
        }, (errorMessage) => {
            // Ignore standard scanning errors
        });

        return () => {
            scanner.clear().catch(console.error);
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            <div className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                <h2 className="text-white font-bold">Scan Barcode</h2>
                <button
                    onClick={onClose}
                    className="bg-white/10 text-white px-4 py-2 rounded-full text-sm"
                >
                    Close
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center bg-black">
                <div id="reader" className="w-full max-w-md overflow-hidden rounded-xl border-2 border-white/20"></div>
            </div>

            <div className="p-6 text-center text-gray-400 text-sm">
                <p>Point camera at a barcode to scan.</p>
                <p className="text-xs mt-2 opacity-50">Ensure you are using HTTPS or localhost for camera access.</p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
