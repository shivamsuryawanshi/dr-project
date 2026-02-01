/**
 * Opens a file URL in a new tab
 * For DOCX/DOC files, uses Google Docs Viewer
 * For PDF files, opens directly in browser
 */
export function openFileInViewer(fileUrl: string): void {
  if (!fileUrl) return;
  
  // Get the full URL
  const fullUrl = fileUrl.startsWith('http') 
    ? fileUrl 
    : `${window.location.origin}${fileUrl}`;
  
  // Check file extension
  const lowerUrl = fullUrl.toLowerCase();
  const isDocx = lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc');
  
  if (isDocx) {
    // Use Google Docs Viewer for Word documents
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    window.open(googleViewerUrl, '_blank');
  } else {
    // Open directly (PDF, images, etc.)
    window.open(fullUrl, '_blank');
  }
}
