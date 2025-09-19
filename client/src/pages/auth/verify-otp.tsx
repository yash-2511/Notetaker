import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Mail } from 'lucide-react';
import { VerifyOtpRequest, verifyOtpSchema } from '@shared/schema';
import { AuthAPI } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyOtpPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  const form = useForm<VerifyOtpRequest>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email,
      otp: '',
    },
  });

  const [otpInputs, setOtpInputs] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const verifyOtpMutation = useMutation({
    mutationFn: AuthAPI.verifyOtp,
    onSuccess: (data) => {
      if (data.token && data.user) {
        login(data.token, data.user);
        toast({
          title: 'Success',
          description: 'Email verified successfully! Welcome to NoteTaker.',
        });
        setLocation('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
      // Clear OTP inputs on error
      setOtpInputs(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => AuthAPI.resendOtp(email),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Resend Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtpInputs.every(digit => digit !== '') && value) {
      const otpCode = newOtpInputs.join('');
      verifyOtpMutation.mutate({ email, otp: otpCode });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpCode = otpInputs.join('');
    if (otpCode.length === 6) {
      verifyOtpMutation.mutate({ email, otp: otpCode });
    }
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate();
  };

  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle={`We've sent a verification code to`}
      icon={<Mail className="text-white" size={24} />}
    >
      <div className="text-center mb-8">
        <p className="text-gray-900 font-medium">{email}</p>
      </div>

      <Card className="shadow-material mb-6">
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* OTP Input Fields */}
            <div className="flex justify-center space-x-3 mb-6">
              {otpInputs.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={verifyOtpMutation.isPending || otpInputs.some(digit => !digit)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-4">
            <span className="text-gray-600">Didn't receive the code? </span>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOtp}
              disabled={resendOtpMutation.isPending}
              className="text-blue-600 font-medium hover:underline p-0"
            >
              {resendOtpMutation.isPending ? 'Sending...' : 'Resend'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
