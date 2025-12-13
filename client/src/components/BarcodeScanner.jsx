import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState('');
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Create instance
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Start scanning
        scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScan(decodedText);
                // We don't auto-close here to allow continuous scanning if needed, 
                // but usually for a modal picker we might want to close. 
                // The user can close manually or the parent can close it.
                // For this use case (filling a form), we probably want to close.
                // But let's leave it to the parent or user to decide, or just close.
                // Given the flow, closing makes sense.
                onClose();
            },
            (errorMessage) => {
                // ignore
            }
        ).catch(err => {
            console.error("Error starting scanner", err);
            setError("Camera access denied or not available. Please use HTTPS.");
        });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => {
                    // console.error("Error stopping scanner", err)
                });
            }
        };
    }, [onScan, onClose]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (scannerRef.current) {
            scannerRef.current.scanFile(file, true)
                .then(decodedText => {
                    onScan(decodedText);
                    onClose();
                })
                .catch(err => {
                    console.error("Error scanning file", err);
                    setError("Could not scan barcode from image.");
                });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {/* Scanner Area */}
            <div className="relative w-full max-w-md aspect-square mx-6 overflow-hidden rounded-3xl border border-white/10 bg-black">
                <div id="reader" className="w-full h-full object-cover"></div>

                {/* Overlay UI */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    {/* Scanner Frame */}
                    <div className="w-64 h-64 border-2 border-[var(--text-rgb-25-81-255)] rounded-2xl relative opacity-50">
                        {/* Scanning Line Animation */}
                        <div className="absolute left-0 right-0 h-0.5 bg-[var(--text-rgb-25-81-255)] shadow-[0_0_8px_rgba(25,81,255,0.8)] animate-scan"></div>
                    </div>
                </div>
            </div>

            {/* Text & Instructions */}
            <div className="mt-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-[var(--text-rgb-25-81-255)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
                    <h2 className="text-xl font-bold">Scan Bar Code</h2>
                </div>
                <p className="text-[var(--text-rgb-117-117-117)] text-sm">Point your camera at a bar code</p>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            {/* Upload Button */}
            <div className="mt-8">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 bg-[#1E1E1E] border border-white/10 px-6 py-4 rounded-xl hover:bg-[#2A2A2A] transition-colors group"
                >
                    <span className="text-white font-medium">Upload From Gallery</span>
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    </div>
                </button>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                /* Hide default html5-qrcode elements we don't want */
                #reader video { object-fit: cover; width: 100% !important; height: 100% !important; border-radius: 1.5rem; }
            `}</style>
        </div>
    );
};

export default BarcodeScanner;
