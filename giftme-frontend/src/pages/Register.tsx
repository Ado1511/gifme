import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const registerSchema = z
  .object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .regex(/[a-zA-Z]/, { message: 'Must include a letter' })
      .regex(/[0-9]/, { message: 'Must include a number' })
      .regex(/[!@#$%^&*{}+\-\/;'\-=`.,]/, { message: 'Must include a special character' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterData = z.infer<typeof registerSchema>;

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const navigate = useNavigate();
  const { login: saveUser } = useAuth();
  const [avatar, setAvatar] = useState<File | null>(null);

  const onSubmit = async (data: RegisterData) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);

    if (avatar) {
      if (avatar.size > 2 * 1024 * 1024) {
        toast.error('Avatar must be less than 2MB');
        return;
      }

      if (avatar.type !== 'image/gif') {
        toast.error('Only GIF files are allowed for avatars');
        return;
      }

      formData.append('avatar', avatar);
    } else {
      const randomAvatars = [
        'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
        'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
        'https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif',
      ];
      const randomUrl = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
      formData.append('avatarUrl', randomUrl);
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.token) {
        saveUser(result.token); // ✅ Guardar token en el contexto

        const decoded = jwtDecode<{ username: string }>(result.token);
        toast.success('Welcome! 🎉');
        navigate(`/profile/${decoded.username}`);
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-darkBackground"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-accent">Create Account</h2>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 text-sm">Username</label>
          <input
            id="username"
            autoComplete="username"
            type="text"
            {...register('username')}
            className="w-full p-2 rounded border dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm">Email</label>
          <input
            id="email"
            autoComplete="email"
            type="email"
            {...register('email')}
            className="w-full p-2 rounded border dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 text-sm">Password</label>
          <input
            id="password"
            autoComplete="new-password"
            type="password"
            {...register('password')}
            className="w-full p-2 rounded border dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1 text-sm">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="w-full p-2 rounded border dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Avatar */}
        <div className="mb-6">
          <label htmlFor="avatar" className="block mb-1 text-sm">
            Profile Picture (GIF only)
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/gif"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full p-2 rounded border dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 text-white transition rounded bg-accent hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
