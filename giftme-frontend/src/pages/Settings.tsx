import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../Hooks/useAuth';

type FormData = {
  username: string;
};

function Settings() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    if (user?.username) {
      reset({ username: user.username });
    }
  }, [user?.username, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/gif') {
        toast.error('Only GIF files are allowed');
        setAvatar(null);
        setPreview(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar too large. Max 2MB.');
        setAvatar(null);
        setPreview(null);
        return;
      }
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append('username', data.username);
    if (avatar) formData.append('avatar', avatar);
  
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
  
      let result;
      try {
        result = await res.json();
      } catch (err) {
        throw new Error('Server returned an invalid response');
      }
  
      if (res.ok) {
        toast.success('Profile updated successfully ✅');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };
  

  return (
    <div className="max-w-lg px-4 py-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-accent">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-semibold">Username</label>
          <input
            {...register('username')}
            className="w-full p-2 border rounded dark:bg-[#2a2a2a] dark:border-gray-600"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">New Avatar (GIF only)</label>
          <input
            type="file"
            accept="image/gif"
            onChange={handleAvatarChange}
            className="w-full p-2 border rounded dark:bg-[#2a2a2a] dark:border-gray-600"
            disabled={isSubmitting}
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Preview:</p>
            <img
              src={preview || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
              alt="Avatar Preview"
              className="object-cover w-24 h-24 rounded-full"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white transition rounded bg-accent hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default Settings;
