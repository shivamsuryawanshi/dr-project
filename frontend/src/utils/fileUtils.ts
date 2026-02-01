/**
 * Opens a file URL in a new tab
 * For PDF files, opens directly in browser
 * For DOCX/DOC files, downloads the file
 */
export function openFileInViewer(fileUrl: string): void {
  if (!fileUrl) return;
  
  // Get the full URL
  const fullUrl = fileUrl.startsWith('http') 
    ? fileUrl 
    : `${window.location.origin}${fileUrl}`;
  
  // Check file extension
  const lowerUrl = fullUrl.toLowerCase();
  const isPdf = lowerUrl.endsWith('.pdf');
  
  if (isPdf) {
    // Open PDF directly in new tab
    window.open(fullUrl, '_blank');
  } else {
    // For DOCX/DOC and other files, trigger download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fullUrl.split('/').pop() || 'resume';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
