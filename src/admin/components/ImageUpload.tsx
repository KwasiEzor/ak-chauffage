import { useState, useRef } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';

interface ImageUploadProps {
  currentValue: string;
  onUploadComplete: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ currentValue, onUploadComplete, label = 'Image Path' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUploadComplete(data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onUploadComplete(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          placeholder="/uploads/image.jpg"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              Uploaded
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload
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
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
          <Check className="w-4 h-4" />
          Image uploaded successfully!
        </div>
      )}
      {currentValue && (
        <div className="mt-2">
          <img
            src={currentValue}
            alt="Preview"
            className="h-20 w-auto rounded-lg border border-zinc-700 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
