import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

function AddClient() {
  const navigate = useNavigate();
  
 const user = JSON.parse(localStorage.getItem('user') || '{}');

useEffect(() => {
 if (user.role !== 'kam' && user.role !== 'accounts' && user.role !== 'hod' && user.role !== 'manager') {
    toast.error('You do not have permission to add clients');
    navigate('/clients');
  }
}, []);
  

// Redirect HOD away from this page
useEffect(() => {
 if (user.role !== 'kam' && user.role !== 'accounts' && user.role !== 'hod' && user.role !== 'manager') {
    toast.error('Manager cannot add clients');
    navigate('/clients');
  }
}, []);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', phone: '', email: '',
    gst: '', scheme: '', leadSource: 'Direct Enquiry', notes: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await API.post('/clients', {
      ...form,
      addedBy: user.id,
      addedByName: user.name,
      createdBy: user.id,
      userRole: user.role,
    });
    toast.success('✅ Client added successfully!');
    navigate('/clients');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add client');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{maxWidth:680}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/clients')}>← Back</button>
        <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:18,fontWeight:700}}>Add New Client</h2>
      </div>

      <div className="card">
        <div className="card-title">Client Details</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input name="companyName" placeholder="e.g. Techwave Pvt Ltd" value={form.companyName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contact Person *</label>
              <input name="contactPerson" placeholder="Full name" value={form.contactPerson} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="phone" placeholder="10-digit mobile" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="email@company.com" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Scheme / Grant *</label>
              <select name="scheme" value={form.scheme} onChange={handleChange} required>
                <option value="">Select scheme...</option>
                <option>Seed Funding 20L</option>
                <option>Seed Funding 50L</option>
                <option>Nidhi Seed Support</option>
                <option>MSME Innovation</option>
                <option>State Grant</option>
                <option>DPIIT Recognition</option>
                <option>Startup India Registration</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lead Source</label>
              <select name="leadSource" value={form.leadSource} onChange={handleChange}>
                <option>Direct Enquiry</option>
                <option>Referral</option>
                <option>WhatsApp</option>
                <option>Website</option>
                <option>Social Media</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GST Number</label>
              <input name="gst" placeholder="GST number (if available)" value={form.gst} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Initial Notes</label>
            <textarea name="notes" placeholder="Source of lead, first call notes, special requirements..." value={form.notes} onChange={handleChange} />
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : '✅ Save & Start Onboarding →'}
            </button>
            <button className="btn btn-outline" type="button" onClick={() => navigate('/clients')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClient;