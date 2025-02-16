'use client';

import { useState } from 'react';
import { ParsedVBOFile } from 'vbo-reader';
import FileUpload from '@/components/FileUpload';
import DataDisplay from '@/components/DataDisplay';

export default function Home() {
  const [vboData, setVboData] = useState<ParsedVBOFile | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VBO File Viewer
          </h1>
          <p className="text-gray-600">
            Upload a VBOX (.vbo) file to view its contents
          </p>
        </div>

        {!vboData ? (
          <FileUpload onFileProcessed={setVboData} />
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <button
                onClick={() => setVboData(null)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Another File
              </button>
            </div>
            <DataDisplay data={vboData} />
          </div>
        )}
      </div>
    </main>
  );
}
