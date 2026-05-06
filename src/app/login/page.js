'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { loginWithRedux } from '../services/api/auth';
import { selectAuthLoading, selectAuthError, clearError } from '@/redux/slices/authSlice';
import Image from 'next/image';

export default function Page() {
  const dispatch = useDispatch();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('validation.usernameRequired');
    }
    
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 3) {
      newErrors.password = t('validation.passwordMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    if (authError) {
      dispatch(clearError());
    }
    
    if (!validateForm()) return;
    
    try {
      const result = await dispatch(loginWithRedux(formData.email, formData.password));
      
      if (result.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat w-full" 
      style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundAttachment: 'scroll' }} 
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex items-center flex-col space-y-4">
            <div className="mx-auto w-20 h-20 relative">
              <Image 
                fill 
                src="/log_in_card_logo.png" 
                alt={t('navigation.appTitle') + " Logo"} 
                sizes="80px"
                className="object-contain" 
                priority
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-wider">
                {t('navigation.appTitle')}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {t('navigation.appSubtitle')}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {authError && (
                  <Alert variant="destructive" className="bg-red-500/20 text-white border-red-500/50">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white">
                    {t('auth.usernameLabel')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder={t('auth.usernamePlaceholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-11 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:ring-blue-500 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    disabled={authLoading}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white">
                    {t('auth.passwordLabel')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`h-11 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:ring-blue-500 ${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      disabled={authLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                      disabled={authLoading}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      <span className="sr-only">
                        {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400 mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-white/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-white/90 cursor-pointer select-none"
                  >
                    {t('auth.rememberMe')}
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('auth.loggingIn')}
                    </>
                  ) : (
                    t('auth.loginButton')
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center space-y-2 pt-0 pb-6">
            <div className="w-full h-px bg-white/10 mb-4" />
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">
              Lexcora ERP system by Almstkshf.com
            </p>
            <p className="text-white/40 text-[10px] text-center px-4">
              {isRTL ? 'للدعم الفني:' : 'For technical support:'} rased@almstkshf.com | 0585952035
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
