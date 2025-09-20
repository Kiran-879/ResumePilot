// src/components/common/FileUpload.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const FileUpload = ({
  onFileSelect,
  acceptedTypes = '.pdf,.doc,.docx',
  maxSize = 5242880, // 5MB
  selectedFile,
  onFileRemove
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize,
    multiple: false
  });

  return (
    <Box>
      {!selectedFile ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.light' : 'background.default',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Accepted formats: PDF, DOC, DOCX (Max: 5MB)
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1">{selectedFile.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
          <IconButton onClick={onFileRemove} color="error">
            <Delete />
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;