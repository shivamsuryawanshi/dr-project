// AI assisted development

// Test Notification Create Karne Ke Liye - Browser Console Mein Run Karein

// Step 1: Test Notification Create Karein
fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('📡 Response status:', res.status);
  return res.json();
})
.then(data => {
  console.log('✅ Test notification created:', data);
  console.log('📋 Notification ID:', data.id);
  console.log('💬 Message:', data.message);
  
  // Step 2: Notifications Fetch Karein (Verify)
  return fetch('/api/notifications?page=0&size=10', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log('📊 Notifications after create:', data);
  console.log('📈 Total notifications:', data.totalElements);
  console.log('📝 Content:', data.content);
  
  // Step 3: Page Refresh Karein
  console.log('🔄 Refreshing page in 2 seconds...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})
.catch(err => {
  console.error('❌ Error:', err);
  console.error('Error details:', err.message);
});

