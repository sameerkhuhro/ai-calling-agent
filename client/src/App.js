import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calls`);
      setCalls(response.data.calls || []);
      console.log('Fetched calls:', response.data); // ✅ use response
    } catch (err) {
      console.error('Error fetching calls:', err);
    }
  };

  const handleInitiateCall = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/calls/initiate`, {
        phone_number: phoneNumber
      });

      console.log('Initiate call response:', response.data); // ✅ use response

      setPhoneNumber('');
      fetchCalls();
      alert('Call initiated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate call');
      console.error('Error initiating call:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallClick = async (callId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calls/${callId}`);
      setSelectedCall(response.data.call);
      console.log('Call details response:', response.data); // ✅ use response
    } catch (err) {
      console.error('Error fetching call details:', err);
      setError('Failed to load call details');
    }
  };

  const handleDeleteCall = async (callId) => {
    if (!window.confirm('Are you sure you want to delete this call?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/calls/${callId}`);
      console.log('Delete call response:', response.data); // ✅ use response
      fetchCalls();
      if (selectedCall && selectedCall.id === callId) {
        setSelectedCall(null);
      }
    } catch (err) {
      console.error('Error deleting call:', err);
      setError('Failed to delete call');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'initiated': '#3498db',
      'ringing': '#f39c12',
      'in-progress': '#2ecc71',
      'completed': '#27ae60',
      'failed': '#e74c3c',
      'canceled': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>📞 AI Calling Agent Dashboard</h1>
          <p>Manage and monitor your AI-powered outbound calls</p>
        </header>

        <div className="main-content">
          <div className="left-panel">
            <div className="initiate-call-card">
              <h2>Initiate New Call</h2>
              <form onSubmit={handleInitiateCall}>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Initiating...' : 'Initiate Call'}
                </button>
              </form>
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="calls-list">
              <h2>Call History ({calls.length})</h2>
              <div className="calls-container">
                {calls.length === 0 ? (
                  <div className="empty-state">No calls yet. Initiate your first call!</div>
                ) : (
                  calls.map(call => (
                    <div
                      key={call.id}
                      className={`call-item ${selectedCall?.id === call.id ? 'active' : ''}`}
                      onClick={() => handleCallClick(call.id)}
                    >
                      <div className="call-header">
                        <span className="call-number">{call.phone_number}</span>
                        <span
                          className="call-status"
                          style={{ backgroundColor: getStatusColor(call.status) }}
                        >
                          {call.status}
                        </span>
                      </div>
                      <div className="call-meta">
                        <span className="call-date">
                          {new Date(call.created_at).toLocaleString()}
                        </span>
                        {call.duration && (
                          <span className="call-duration">{call.duration}s</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="right-panel">
            {selectedCall ? (
              <div className="call-details">
                <div className="call-details-header">
                  <h2>Call Details</h2>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCall(selectedCall.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="detail-section">
                  <h3>Information</h3>
                  <div className="detail-item">
                    <strong>Phone Number:</strong> {selectedCall.phone_number}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedCall.status) }}
                    >
                      {selectedCall.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Created:</strong> {new Date(selectedCall.created_at).toLocaleString()}
                  </div>
                  {selectedCall.duration && (
                    <div className="detail-item">
                      <strong>Duration:</strong> {selectedCall.duration} seconds
                    </div>
                  )}
                </div>

                {selectedCall.transcript && (
                  <div className="detail-section">
                    <h3>Transcript</h3>
                    <div className="transcript-box">
                      <pre>{selectedCall.transcript}</pre>
                    </div>
                  </div>
                )}

                {selectedCall.summary && (
                  <div className="detail-section">
                    <h3>AI Summary</h3>
                    <div className="summary-box">
                      <p>{selectedCall.summary}</p>
                    </div>
                  </div>
                )}

                {selectedCall.extracted_answers && (
                  <div className="detail-section">
                    <h3>Extracted Information</h3>
                    <div className="extracted-box">
                      <pre>{JSON.stringify(selectedCall.extracted_answers, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {!selectedCall.transcript && !selectedCall.summary && (
                  <div className="empty-details">
                    <p>Call is in progress or no data available yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-details">
                <h2>Select a call to view details</h2>
                <p>Click on any call from the list to see its transcript, summary, and extracted information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
