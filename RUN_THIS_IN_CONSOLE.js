// AI assisted development

// ============================================
// TEST NOTIFICATION CREATE KARNE KE LIYE
// Browser Console Mein Copy-Paste Karein
// ============================================

fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('📡 Response Status:', res.status);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
})
.then(data => {
  console.log('✅ Test notification created successfully!');
  console.log('📋 Notification Details:', data);
  console.log('🆔 ID:', data.id);
  console.log('💬 Message:', data.message);
  console.log('👤 User ID:', data.userId);
  
  // Verify - Notifications fetch karein
  console.log('🔍 Verifying notification...');
  return fetch('/api/notifications?page=0&size=10', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log('📊 Verification Result:');
  console.log('📈 Total Notifications:', data.totalElements);
  console.log('📝 Notifications List:', data.content);
  
  if (data.totalElements > 0) {
    console.log('🎉 SUCCESS! Notification created and verified!');
    console.log('🔄 Refreshing page in 2 seconds...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    console.warn('⚠️ Notification created but not found in list. Please refresh manually.');
  }
})
.catch(err => {
  console.error('❌ Error creating notification:', err);
  console.error('Error Message:', err.message);
  console.log('💡 Tips:');
  console.log('1. Check if you are logged in');
  console.log('2. Check if backend is running on http://localhost:8081');
  console.log('3. Check browser Network tab for detailed error');
});

