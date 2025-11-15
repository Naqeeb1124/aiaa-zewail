import React, { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, initialImageUrl }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // For preview
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setError('Please select an image to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `images/${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      onUploadSuccess(downloadURL);
      setImageUrl(downloadURL); // Update preview with actual URL
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent default paste behavior

    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          setImageUrl(URL.createObjectURL(file));
          setError(null);
          return;
        }
      }
    }

    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
      setImageUrl(pastedText);
      onUploadSuccess(pastedText);
      setError(null);
    } else {
      setError('Pasted content is not a valid image or image URL.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="p-2 border rounded"
      />
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        onPaste={handlePaste}
        placeholder="Or paste image URL here"
        className="p-2 border rounded"
      />
      {imageUrl && (
        <div className="mt-2">
          <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded" />
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!imageFile || uploading}
        className="px-4 py-2 rounded bg-featured-blue text-white hover:bg-featured-green transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
};

export default ImageUpload;
