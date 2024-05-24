import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/authorization/IsLogged';

interface ChangePasswordWindowProps {
  show: boolean;
  handleClose: () => void;
}

const ChangePasswordWindow: React.FC<ChangePasswordWindowProps> = ({ show, handleClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { isAuthenticated,token } = useAuth();
  const handleSubmit = async () => {
    if (!isAuthenticated) {
        throw new Error('Token not found in localStorage');
    }
    const headers = { Authorization: `Bearer ${token}` };
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 25) {
      setPasswordError('Password must be between 8 and 25 characters');
      return;
    }

    try {
      await axios.put(`http://localhost:3000/users/password`, { oldPassword, newPassword }, { headers });
      alert('Password changed successfully');
      handleClose();
    } catch (error) {
      alert('Failed to change password');
    }
  };

  const isFormValid = oldPassword && newPassword && confirmNewPassword;

  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Change Password</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <input type="password" className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                {passwordError && <div className="text-danger">{passwordError}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit} disabled={!isFormValid}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordWindow;