import React from 'react';

const NeuModal = ({ isOpen, onClose, title, message, type, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="neu-card p-8 w-full max-w-md mx-4 transform transition-all scale-100">
                <h3 className="text-xl font-bold text-[#6d5dfc] mb-4 border-b border-gray-200 pb-2">
                    {title || (type === 'confirm' ? 'Confirmare' : 'Informare')}
                </h3>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end gap-4">
                    {type === 'confirm' && (
                        <button
                            onClick={onClose}
                            className="neu-btn px-6 py-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            Anulează
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`neu-btn px-6 py-2 text-sm text-white ${type === 'confirm' ? 'neu-btn-primary' : 'bg-[#6d5dfc]'}`}
                    >
                        {type === 'confirm' ? 'Confirmă' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NeuModal;
