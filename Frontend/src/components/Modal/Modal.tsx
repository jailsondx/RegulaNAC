import React, { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children, title }) => {
    if (!show) return null;

    return (
        <div className="modal">
            <div className='modal-Form'>
                <label className='Title-Form'> {title} </label>
            </div>
            
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
