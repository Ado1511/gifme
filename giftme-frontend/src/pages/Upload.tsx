import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to upload a GIF');
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'image/gif') {
        toast.error('Only .gif files are allowed');
        setFile(null);
        setPreview(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB.');
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a GIF to upload');
      return;
    }

    const formData = new FormData();
    
    // ✅ CAMBIO AQUÍ: el backend espera el campo como "file", no "gif"
    formData.append('file', file); 
    formData.append('caption', caption);

    const toastId = toast.loading('Uploading your GIF...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/gif/upload-file', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned an invalid response');
      }

      if (res.ok) {
        toast.success('GIF uploaded successfully! 🎉', { id: toastId });
        setFile(null);
        setCaption('');
        setPreview(null);
        navigate('/feed');
      } else {
        toast.error(data.message || 'Upload failed', { id: toastId });
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      toast.error('Upload failed', { id: toastId });
    }
  };

  return (
    <div className="max-w-xl p-4 mx-auto">
      <h2 className="mb-6 text-2xl font-bold text-accent">Upload a GIF</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/gif"
          onChange={handleFileChange}
          className="p-2 border dark:border-gray-600 dark:bg-[#2a2a2a] rounded"
        />
        {preview && (
          <div className="mb-4">
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Preview:</p>
            <img src={preview} alt="Preview" className="w-full rounded" />
          </div>
        )}
        <textarea
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="p-2 border dark:border-gray-600 dark:bg-[#2a2a2a] rounded resize-none"
          rows={3}
        />
        <button
          type="submit"
          className="px-4 py-2 text-white transition rounded bg-accent hover:opacity-90"
        >
          Post GIF
        </button>
      </form>
    </div>
  );
}

export default Upload;
