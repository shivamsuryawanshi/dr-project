// AI assisted development

// ONE LINE - Copy Paste Karein Console Mein
fetch('/api/notifications/test', {method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}}).then(r => r.json()).then(d => {console.log('✅ Created:', d); setTimeout(() => window.location.reload(), 1000);}).catch(e => console.error('❌ Error:', e));

