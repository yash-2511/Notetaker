import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { SignupRequest, signupSchema } from '@shared/schema';
import { AuthAPI } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<SignupRequest>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: AuthAPI.signup,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      setLocation(`/auth/verify-otp?email=${encodeURIComponent(data.email || '')}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SignupRequest) => {
    signupMutation.mutate(data);
  };

  const handleGoogleAuth = async () => {
    try {
      await AuthAPI.googleAuth();
      toast({
        title: 'Info',
        description: 'Google authentication is not yet implemented',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Google authentication failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout title="Welcome to NoteTaker" subtitle="Create your account to start taking notes">
      {/* Signup Form Card */}
      <Card className="shadow-material mb-6">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Full Name</Label>
              <Input
                {...form.register('name')}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Email Address</Label>
              <Input
                {...form.register('email')}
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Password</Label>
              <div className="relative">
                <Input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {signupMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Signup */}
          <Button
            onClick={handleGoogleAuth}
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </Button>
        </CardContent>
      </Card>

      {/* Login Link */}
      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
