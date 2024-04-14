import React, { FC } from 'react';

interface ConfirmationWindowProps {
  show: boolean;
  handleConfirm: () => void;
  handleCancel: () => void;
}

const ConfirmationWindow: FC<ConfirmationWindowProps> = ({ show, handleConfirm, handleCancel }) => {
    return (
      <div className={`modal ${show ? 'show d-block' : 'd-none'}`}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmation</h5>
              <button type="button" className="btn-close" onClick={handleCancel}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to do this?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmationWindow;