import React, { type ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, onClose }) => (
   <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg relative w-full max-w-md">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

export default Modal;