 'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { VBOReader, ParsedVBOFile, VBOParserError } from 'vbo-reader';

interface FileUploadProps {
  onFileProcessed: (data: ParsedVBOFile) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const file = acceptedFiles[0];
      if (!file) {
        throw new Error('No file selected');
      }

      if (!file.name.endsWith('.vbo')) {
        throw new Error('Please upload a .vbo file');
      }

      const content = await file.text();
      try {
        const data = VBOReader.parse(content);
        onFileProcessed(data);
      } catch (parseError) {
        if (parseError instanceof VBOParserError) {
          throw new Error(`Invalid VBO file: ${parseError.message}`);
        }
        throw parseError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.vbo']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 14v6m0 0v6m0-6h6m-6 0h-6"
            />
          </svg>
          {isLoading ? (
            <p className="text-sm text-gray-600">Processing file...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag and drop a .vbo file, or click to select'}
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
