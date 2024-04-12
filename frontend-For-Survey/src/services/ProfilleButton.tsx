import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ProfileButton({ nickname }: { nickname: string }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={handleShow}>
        {nickname}
      </button>

      <div className={`modal ${show ? 'show d-block' : 'd-none'}`} onClick={handleClose} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, left: 'auto', transform: 'none' }}>
        <div className="modal-dialog" style={{ margin: 'auto' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{nickname}'s Profile</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
                <Link to={`/profile/${nickname}`} className="btn btn-primary">Go to Profile</Link>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileButton;