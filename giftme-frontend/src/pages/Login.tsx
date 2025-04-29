import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 👈 Usa tu contexto global

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginData = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Contexto de autenticación

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        login(result.token); // ✅ Guardamos el token en el AuthContext
        toast.success(`Welcome back, ${result.user.username}!`);
        navigate(`/profile/${result.user.username}`);
      } else {
        toast.error(result.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-darkBackground"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-accent">Log in to GiftME</h2>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full p-2 border rounded dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full p-2 border rounded dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-600"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 text-white transition rounded bg-accent hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default Login;
