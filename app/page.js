'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Home() {
  // --- APP CONTROL STATE ---
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [currentTab, setCurrentTab] = useState('log'); // tabs: 'log', 'feed', 'settings'

  // --- INITIAL SETUP / PROFILES STATE ---
  const [users, setUsers] = useState(['User 1', 'User 2']);
  const [newUserName, setNewUserName] = useState('');
  
  const [banks, setBanks] = useState([
    'SBI', 'HDFC', 'ICICI', 'Union Bank', 'Axis Bank', 'Kotak', 'Saptagiri Bank'
  ]);
  const [newBankName, setNewBankName] = useState('');

  // --- MULTIPLE PROJECTS STATE ---
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFeedProject, setSelectedFeedProject] = useState('All Projects');

  // --- EXPENSE FORM STATE ---
  const [selectedProject, setSelectedProject] = useState('');
  const [buyer, setBuyer] = useState('User 1');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PhonePe');
  const [bankAccount, setBankAccount] = useState('SBI');

  // --- STORAGE FOR RECEIPTS ---
  const [receipts, setReceipts] = useState([]);

  // --- NEW: CLOUD DATA FETCHING ON LOAD ---
  useEffect(() => {
    async function fetchCloudData() {
      // Fetch projects
      const { data: projData } = await supabase.from('projects').select('*');
      if (projData) {
        const projNames = projData.map(p => p.name);
        setProjects(projNames);
        if (projNames.length > 0 && !selectedProject) setSelectedProject(projNames[0]);
      }
      
      // Fetch expenses (receipts)
      const { data: expData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (expData) setReceipts(expData);
    }
    fetchCloudData();
  }, []);

  // --- COMPUTE STATISTICS (The Auto-Calculator) ---
  const filteredReceipts = receipts.filter(r => 
    selectedFeedProject === 'All Projects' || r.project === selectedFeedProject
  );

  const totalSpent = filteredReceipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const userBreakdown = {};
  users.forEach(user => {
    userBreakdown[user] = filteredReceipts
      .filter(r => r.buyer === user)
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  });

  // --- MANAGEMENT FUNCTIONS ---
  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUserName.trim()) {
      setUsers([...users, newUserName.trim()]);
      setNewUserName('');
    }
  };

  const handleEditUser = (index, currentName) => {
    const newName = prompt(`Rename "${currentName}" to:`, currentName);
    if (newName && newName.trim() !== '') {
      const updatedUsers = [...users];
      updatedUsers[index] = newName.trim();
      setUsers(updatedUsers);
      if (buyer === currentName) setBuyer(newName.trim());
    }
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    if (newBankName.trim()) {
      setBanks([...banks, newBankName.trim()]);
      setNewBankName('');
    }
  };

  const handleEditBank = (index, currentBank) => {
    const newBank = prompt(`Rename bank "${currentBank}" to:`, currentBank);
    if (newBank && newBank.trim() !== '') {
      const updatedBanks = [...banks];
      updatedBanks[index] = newBank.trim();
      setBanks(updatedBanks);
      if (bankAccount === currentBank) setBankAccount(newBank.trim());
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const name = newProjectName.trim();
      
      // Save directly to Supabase cloud!
      await supabase.from('projects').insert([{ name }]);
      
      const updatedProjects = [...projects, name];
      setProjects(updatedProjects);
      setNewProjectName('');
      if (!selectedProject) setSelectedProject(name);
    }
  };

  const handleEditProject = (index, currentProject) => {
    const newProjName = prompt(`Rename project "${currentProject}" to:`, currentProject);
    if (newProjName && newProjName.trim() !== '') {
      const updatedProjects = [...projects];
      updatedProjects[index] = newProjName.trim();
      setProjects(updatedProjects);
      if (selectedProject === currentProject) setSelectedProject(newProjName.trim());
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      alert("Please add and select a Project Site first!");
      return;
    }
    if (!itemName || !amount) {
      alert("Please fill out at least Material/Service Name and Amount!");
      return;
    }
    
    const newReceipt = {
      date: new Date().toLocaleDateString(),
      project: selectedProject,
      buyer,
      itemName,
      quantity,
      vendorName,
      amount: parseFloat(amount),
      paymentMethod,
      bankAccount: paymentMethod === 'Cash' ? 'N/A (Cash)' : bankAccount
    };

    // Save directly to Supabase cloud!
    await supabase.from('expenses').insert([newReceipt]);

    setReceipts([newReceipt, ...receipts]);
    setItemName('');
    setQuantity('');
    setVendorName('');
    setAmount('');
    
    setSelectedFeedProject(selectedProject);
    setCurrentTab('feed');
  };

  // Common background container styling used for both setups
  const pageContainerStyle = {
    fontFamily: 'sans-serif',
    maxWidth: '450px',
    margin: '0 auto',
    padding: '15px',
    paddingBottom: '80px',
    minHeight: '100vh',
    position: 'relative',
    backgroundColor: '#ffffff',
    backgroundImage: "linear-gradient(rgba(155, 255, 255, 0.25), rgba(155, 255, 255, 0.30)), url('/bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  // --- 1. THE INITIAL SETUP SCREEN ---
  if (!isSetupDone) {
    return (
      <div style={pageContainerStyle}>
        {/* Company Branding at Top of Setup */}
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1a365d', fontWeight: '800', letterSpacing: '0.5px' }}>JEEYA</h1>
          <div style={{ fontSize: '12px', letterSpacing: '3px', color: '#4a5568', fontWeight: 'bold' }}>CONSTRUCTIONS</div>
        </div>

        <p style={{ textAlign: 'center', color: '#4a5568', fontSize: '13px', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '8px', borderRadius: '6px' }}>
          Welcome! Let's complete the quick baseline configuration.
        </p>
        
        {/* Setup Users */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#2d3748' }}>👥 Active Partners</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {users.map((u, idx) => (
              <span key={idx} onClick={() => handleEditUser(idx, u)} style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                👤 {u} ✏️
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="text" placeholder="Add custom name..." value={newUserName} onChange={(e) => setNewUserName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
            <button onClick={handleAddUser} style={{ padding: '8px 12px', backgroundColor: '#1a365d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
          </div>
        </div>

        {/* Setup Projects/Sites */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#2d3748' }}>🚧 Add Project Sites</h4>
          {projects.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', margin: '0 0 10px 0' }}>No active sites added yet. Add your first site below.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {projects.map((p, idx) => (
                <span key={idx} onClick={() => handleEditProject(idx, p)} style={{ padding: '6px 12px', backgroundColor: '#e2f5ea', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', color: '#276749', cursor: 'pointer' }}>
                  📍 {p} ✏️
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="text" placeholder="e.g. Balaji Heights, Site A..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
            <button onClick={handleAddProject} style={{ padding: '8px 12px', backgroundColor: '#2f855a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
          </div>
        </div>

        {/* Setup Banks */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #cbd5e0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ marginTop: 0, marginBottom: '5px', color: '#2d3748' }}>🏦 Business Bank Accounts</h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#718096' }}>Tap any card/bank below to edit.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {banks.map((b, idx) => (
              <span key={idx} onClick={() => handleEditBank(idx, b)} style={{ padding: '6px 12px', backgroundColor: '#feebc8', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', color: '#c05621', cursor: 'pointer' }}>
                💳 {b} ✏️
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="text" placeholder="Add bank account..." value={newBankName} onChange={(e) => setNewBankName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
            <button onClick={handleAddBank} style={{ padding: '8px 12px', backgroundColor: '#b7791f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
          </div>
        </div>

        <button 
          onClick={() => {
            if (users.length === 0 || banks.length === 0 || projects.length === 0) {
              alert("Please configure at least one User, one Site, and one Bank to start!");
              return;
            }
            setBuyer(users[0]);
            setBankAccount(banks[0]);
            if (!selectedProject) setSelectedProject(projects[0]);
            setIsSetupDone(true);
          }} 
          style={{ width: '100%', padding: '16px', backgroundColor: '#1a365d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(26,54,93,0.2)' }}
        >
          🚀 Open Dashboard
        </button>
      </div>
    );
  }

  // --- 2. MAIN APP CONTAINER ---
  return (
    <div style={pageContainerStyle}>
      
      {/* Permanent Brand Logo Header on Dashboard Pages */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e0', paddingBottom: '12px', marginBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#1a365d', fontWeight: '900', letterSpacing: '0.5px' }}>JEEYA CONSTRUCTIONS</h1>
        <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
          {currentTab === 'log' && '➕ Log New Purchase'}
          {currentTab === 'feed' && '📋 Live Activity Feed'}
          {currentTab === 'settings' && '⚙️ App Settings'}
        </div>
      </div>

      {/* TAB 1: LOG EXPENSE */}
      {currentTab === 'log' && (
        <form onSubmit={handleLogExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Select Project Site</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontWeight: 'bold', color: '#276749', backgroundColor: '#f0fff4' }}>
              {projects.map((p, i) => <option key={i} value={p}>📍 {p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Who Paid?</label>
            <select value={buyer} onChange={(e) => setBuyer(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
              {users.map((u, i) => <option key={i} value={u}>{u}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Material / Service</label>
              <input type="text" placeholder="e.g. Cement, Bricks, Sand" value={itemName} onChange={(e) => setItemName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Qty</label>
              <input type="text" placeholder="10 bags" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Shop Name / Owner Name</label>
            <input type="text" placeholder="Where was it bought?" value={vendorName} onChange={(e) => setVendorName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Amount Paid (₹)</label>
            <input type="number" placeholder="Total Cost in Rupees" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Payment Mode</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
              <option value="PhonePe">PhonePe</option>
              <option value="GooglePay">GooglePay</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {paymentMethod !== 'Cash' && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#4a5568' }}>Paid From Which Bank?</label>
              <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                {banks.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#1a365d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(26,54,93,0.3)' }}>
            💾 Save Purchase Entry
          </button>
        </form>
      )}

      {/* TAB 2: LIVE ACTIVITY FEED & AUTO-CALCULATOR */}
      {currentTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Project Filtering Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(235, 248, 255, 0.95)', padding: '10px', borderRadius: '8px', border: '1px solid #bee3f8' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2b6cb0' }}>Filter Site:</span>
            <select value={selectedFeedProject} onChange={(e) => setSelectedFeedProject(e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #90cdf4', fontWeight: 'bold' }}>
              <option value="All Projects">📂 All Projects / Sites</option>
              {projects.map((p, i) => <option key={i} value={p}>📍 {p}</option>)}
            </select>
          </div>

          {/* AUTO CALCULATOR CARD */}
          <div style={{ backgroundColor: '#1a365d', color: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#cbd5e0', marginBottom: '2px' }}>
              Expense Calculator ({selectedFeedProject})
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#48bb78', marginBottom: '10px' }}>
              ₹{totalSpent.toLocaleString('en-IN')} <span style={{ fontSize: '12px', color: '#a0aec0', fontWeight: 'normal' }}>Total spent</span>
            </div>
            
            <div style={{ borderTop: '1px solid #2b4c7e', paddingTop: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#cbd5e0' }}>Paid Breakdown:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {users.map((user, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>👤 {user}</span>
                    <span style={{ fontWeight: 'bold', color: '#edf2f7' }}>₹{(userBreakdown[user] || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* THE FEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReceipts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#4a5568', fontSize: '14px', marginTop: '20px', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '6px' }}>No transactions recorded for this project site.</p>
            ) : (
              filteredReceipts.map((r) => (
                <div key={r.id} style={{ padding: '14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #edf2f7', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#e53e3e', fontSize: '16px' }}>₹{r.amount.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#718096', fontSize: '12px' }}>{r.date}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#2f855a', fontWeight: 'bold', marginBottom: '4px' }}>
                    📍 {r.project}
                  </div>

                  <div style={{ fontSize: '14px', color: '#2d3748', lineHeight: '1.4' }}>
                    <strong>{r.buyer}</strong> purchased <strong>{r.quantity || 'some'} {r.itemName}</strong> from <em>{r.vendorName || 'Direct Vendor'}</em>.
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '6px', backgroundColor: '#edf2f7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                    💳 Mode: {r.paymentMethod} {r.paymentMethod !== 'Cash' && `(${r.bankAccount})`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS SCREEN */}
      {currentTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Projects/Sites Block */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2d3748' }}>🚧 Manage Project Sites</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {projects.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#22543d' }}>📍 {p}</span>
                  <button onClick={() => handleEditProject(i, p)} style={{ background: 'none', border: 'none', color: '#38a169', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✏️ Edit Site</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddProject} style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Add new site..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
            </form>
          </div>

          {/* Managed Users Block */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2d3748' }}>👥 Manage Active Team Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {users.map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#4a5568' }}>👤 {u}</span>
                  <button onClick={() => handleEditUser(i, u)} style={{ background: 'none', border: 'none', color: '#1a365d', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✏️ Edit Name</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Add new person..." value={newUserName} onChange={(e) => setNewUserName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#1a365d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
            </form>
          </div>

          {/* Clean Unified Banks Block */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#2d3748' }}>🏦 Business Bank Accounts</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#718096' }}>Tap edit to match your exact card/account names.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {banks.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#c05621' }}>💳 {b}</span>
                  <button onClick={() => handleEditBank(i, b)} style={{ background: 'none', border: 'none', color: '#dd6b20', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✏️ Edit Name</button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddBank} style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Add custom bank account..." value={newBankName} onChange={(e) => setNewBankName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#dd6b20', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
            </form>
          </div>

        </div>
      )}

      {/* --- MOBILE FOOTER NAVIGATION BAR --- */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '450px', margin: '0 auto', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => setCurrentTab('log')} style={{ background: 'none', border: 'none', color: currentTab === 'log' ? '#1a365d' : '#718096', fontWeight: currentTab === 'log' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>➕</span>Log Purchase
        </button>
        <button onClick={() => setCurrentTab('feed')} style={{ background: 'none', border: 'none', color: currentTab === 'feed' ? '#1a365d' : '#718096', fontWeight: currentTab === 'feed' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>📋</span>History Feed
        </button>
        <button onClick={() => setCurrentTab('settings')} style={{ background: 'none', border: 'none', color: currentTab === 'settings' ? '#1a365d' : '#718096', fontWeight: currentTab === 'settings' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>⚙️</span>Settings
        </button>
      </div>

    </div>
  );
}