// AI assisted development
package com.medexjob.service;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    // FTP Configuration from Hostinger
    @Value("${ftp.host:82.180.143.101}")
    private String ftpHost;

    @Value("${ftp.port:21}")
    private int ftpPort;

    @Value("${ftp.username:u284488379}")
    private String ftpUsername;

    @Value("${ftp.password:Shivam@3650}")
    private String ftpPassword;

    @Value("${ftp.remote-dir:public_html/uploads}")
    private String ftpRemoteDir;

    @Value("${file.base-url:https://medexjob.com}")
    private String baseUrl;

    // Allowed file types
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg"
    );

    // Allowed extensions
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "pdf", "doc", "docx", "png", "jpg", "jpeg"
    );

    // Dangerous file types to reject
    private static final List<String> DANGEROUS_EXTENSIONS = Arrays.asList(
        "exe", "js", "zip", "rar", "sh", "bat", "cmd", "com", "scr", "vbs", "jar", "dll"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload file to Hostinger FTP server and return public URL
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizeFilename(originalFilename);

        FTPClient ftpClient = new FTPClient();
        InputStream inputStream = null;

        try {
            // Connect to FTP server
            logger.info("Connecting to FTP server: {}:{}", ftpHost, ftpPort);
            ftpClient.connect(ftpHost, ftpPort);
            
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new IOException("FTP server refused connection. Reply code: " + replyCode);
            }

            // Login to FTP server
            boolean loginSuccess = ftpClient.login(ftpUsername, ftpPassword);
            if (!loginSuccess) {
                throw new IOException("FTP login failed. Please check credentials.");
            }

            logger.info("Successfully logged in to FTP server");

            // Set file type to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.setFileTransferMode(FTP.BINARY_FILE_TYPE);

            // Enable passive mode (important for most FTP servers)
            ftpClient.enterLocalPassiveMode();

            // Create remote directory if it doesn't exist
            createRemoteDirectory(ftpClient, ftpRemoteDir);

            // Change to remote directory
            boolean changedDir = ftpClient.changeWorkingDirectory(ftpRemoteDir);
            if (!changedDir) {
                throw new IOException("Failed to change to remote directory: " + ftpRemoteDir);
            }

            // Upload file
            inputStream = file.getInputStream();
            logger.info("Uploading file: {} to FTP server", uniqueFilename);
            
            boolean uploadSuccess = ftpClient.storeFile(uniqueFilename, inputStream);
            if (!uploadSuccess) {
                String errorMessage = "Failed to upload file. FTP reply: " + ftpClient.getReplyString();
                logger.error(errorMessage);
                throw new IOException(errorMessage);
            }

            logger.info("File uploaded successfully to FTP: {}", uniqueFilename);

            // Generate public URL
            String publicUrl = baseUrl + "/uploads/" + uniqueFilename;
            
            logger.info("File uploaded successfully: {} -> {}", originalFilename, publicUrl);
            
            return publicUrl;

        } catch (IOException e) {
            logger.error("Error uploading file to FTP server", e);
            throw new IOException("Failed to upload file to FTP server: " + e.getMessage(), e);
        } finally {
            // Close input stream
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    logger.warn("Error closing input stream", e);
                }
            }

            // Logout and disconnect
            if (ftpClient.isConnected()) {
                try {
                    ftpClient.logout();
                    ftpClient.disconnect();
                    logger.info("Disconnected from FTP server");
                } catch (IOException e) {
                    logger.warn("Error disconnecting from FTP server", e);
                }
            }
        }
    }

    /**
     * Create remote directory if it doesn't exist
     */
    private void createRemoteDirectory(FTPClient ftpClient, String remoteDir) throws IOException {
        String[] directories = remoteDir.split("/");
        StringBuilder currentPath = new StringBuilder();

        for (String directory : directories) {
            if (directory.isEmpty()) {
                continue;
            }
            currentPath.append("/").append(directory);
            String path = currentPath.toString();

            // Check if directory exists
            boolean exists = ftpClient.changeWorkingDirectory(path);
            if (!exists) {
                // Create directory
                boolean created = ftpClient.makeDirectory(path);
                if (created) {
                    logger.info("Created remote directory: {}", path);
                } else {
                    logger.warn("Failed to create directory: {}. It may already exist.", path);
                }
            }
        }
    }

    /**
     * Validate file type, size, and security
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        // Get file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name is empty");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();

        // Check for dangerous extensions
        if (DANGEROUS_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File type not allowed: " + extension);
        }

        // Check for allowed extensions
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: pdf, doc, docx, png, jpg, jpeg");
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            // Additional check: sometimes MIME type might not match, so we rely on extension
            logger.warn("MIME type {} doesn't match allowed types, but extension {} is allowed", contentType, extension);
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * Sanitize filename to prevent path traversal attacks
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "file";
        }
        // Remove path separators and dangerous characters
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /**
     * Delete file from FTP server
     */
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        // Extract filename from URL
        String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        
        FTPClient ftpClient = new FTPClient();

        try {
            // Connect to FTP server
            logger.info("Connecting to FTP server for deletion: {}:{}", ftpHost, ftpPort);
            ftpClient.connect(ftpHost, ftpPort);
            
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new IOException("FTP server refused connection. Reply code: " + replyCode);
            }

            // Login to FTP server
            boolean loginSuccess = ftpClient.login(ftpUsername, ftpPassword);
            if (!loginSuccess) {
                throw new IOException("FTP login failed. Please check credentials.");
            }

            // Set file type to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();

            // Change to remote directory
            boolean changedDir = ftpClient.changeWorkingDirectory(ftpRemoteDir);
            if (!changedDir) {
                logger.warn("Failed to change to remote directory: {}. File may not exist.", ftpRemoteDir);
                return;
            }

            // Delete file
            boolean deleted = ftpClient.deleteFile(filename);
            if (deleted) {
                logger.info("File deleted from FTP server: {}", filename);
            } else {
                logger.warn("Failed to delete file from FTP server: {}. File may not exist.", filename);
            }

        } catch (IOException e) {
            logger.error("Error deleting file from FTP server: {}", filename, e);
            throw new IOException("Failed to delete file from FTP server: " + e.getMessage(), e);
        } finally {
            // Logout and disconnect
            if (ftpClient.isConnected()) {
                try {
                    ftpClient.logout();
                    ftpClient.disconnect();
                } catch (IOException e) {
                    logger.warn("Error disconnecting from FTP server", e);
                }
            }
        }
    }
}
