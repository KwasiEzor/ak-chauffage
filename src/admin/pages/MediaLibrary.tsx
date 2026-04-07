import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../utils/api';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Copy,
} from 'lucide-react';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMedia();
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load media files',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are allowed' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);
      await adminApi.uploadImage(file);
      setMessage({ type: 'success', text: `${file.name} uploaded successfully!` });
      await loadFiles();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload file',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      await adminApi.deleteImage(filename);
      setMessage({ type: 'success', text: 'File deleted successfully!' });
      setSelectedFile(null);
      await loadFiles();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete file',
      });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setMessage({ type: 'success', text: 'URL copied to clipboard!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
          <p className="text-zinc-400">Upload and manage images for your website</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Image
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-white font-semibold mb-2">Drop images here or click to upload</p>
        <p className="text-sm text-zinc-500">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{files.length}</div>
          <div className="text-sm text-zinc-400">Total Files</div>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">
            {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
          </div>
          <div className="text-sm text-zinc-400">Total Size</div>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{filteredFiles.length}</div>
          <div className="text-sm text-zinc-400">Filtered Results</div>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">
            {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.filename}
              onClick={() => setSelectedFile(file)}
              className="group relative aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500 transition-colors"
            >
              <img
                src={file.url}
                alt={file.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center p-2">
                  <p className="text-xs font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-zinc-400 mt-1">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-zinc-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedFile.url}
                alt={selectedFile.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedFile.filename}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Size:</span>
                    <span className="text-white ml-2">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Uploaded:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedFile.url}
                    readOnly
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <button
                    onClick={() => copyUrl(selectedFile.url)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={selectedFile.url}
                  download={selectedFile.filename}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => deleteFile(selectedFile.filename)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
