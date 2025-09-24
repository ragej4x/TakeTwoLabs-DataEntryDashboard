import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from '../../assets/image.png';
import { loginApi, registerApi, onGlobalLoadingChange } from '../api';
import { toast } from 'sonner@2.0.3';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { LoadingOverlay } from './ui/loading-overlay';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [globalLoadingCount, setGlobalLoadingCount] = useState(0);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingLogin) return;
    setIsLoadingLogin(true);
    try {
      const res = await loginApi(loginForm.email, loginForm.password);
      localStorage.setItem('tt_token', res.access_token);
      onLogin();
    } catch (err) {
      console.error(err);
      let message = 'Login failed';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.detail) message = parsed.detail;
        } catch {
          if (err.message) message = err.message;
        }
      }
      toast.error(message);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingRegister) return;
    
    // Show loading state while validating
    setIsLoadingRegister(true);
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoadingRegister(false);
      return;
    }
    
    // Simulate validation check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoadingRegister(false);
    // Open confirmation dialog instead; actual register happens on confirm
    setConfirmOpen(true);
  };

  const confirmRegister = async () => {
    if (isLoadingRegister) return;
    setIsLoadingRegister(true);
    try {
      const res = await registerApi({
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        phone: registerForm.phone,
      });
      localStorage.setItem('tt_token', res.access_token);
      setConfirmOpen(false);
      toast.success('Success! Waiting for admin approval.');
      
      // Show loading overlay during redirect
      setIsRedirecting(true);
      // Add a small delay to show the success message and loading animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = "";
      //onLogin();
      
    } catch (err) {
      console.error(err);
      let message = 'Registration failed';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.detail) message = parsed.detail;
        } catch {
          if (err.message) message = err.message;
        }
      }
      toast.error(message);
    } finally {
      setIsLoadingRegister(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = onGlobalLoadingChange((count) => setGlobalLoadingCount(count));
    return () => unsubscribe();
  }, []);

  const slideVariants = {
    initial: { x: 0 },
    slideLeft: { x: '-100%' },
    slideRight: { x: '100%' }
  };

  const fadeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <LoadingOverlay show={isLoadingLogin || isLoadingRegister || isRedirecting || globalLoadingCount > 0} />
      <Card className="w-full max-w-6xl h-[600px] overflow-hidden relative">
        <div className="relative w-full h-full flex">
          {/* Login Form */}
          <motion.div
            className="w-1/2 h-full flex items-center justify-center p-8 bg-card absolute"
            variants={slideVariants}
            animate={isRegister ? 'slideLeft' : 'initial'}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ 
              left: '0%',
              zIndex: isRegister ? 1 : 2 
            }}
          >
            <motion.div 
              className="w-full max-w-md"
              variants={fadeVariants}
              animate={!isRegister ? 'visible' : 'hidden'}
              transition={{ duration: 0.4, delay: isRegister ? 0 : 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsRegister(true)}
                  >
                    Don't have an account? <span className="text-primary">Sign up</span>
                  </button>
                </div>
              </form>
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm registration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please confirm your details before creating an account
                      <br />

                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoadingRegister}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRegister} disabled={isLoadingRegister}>
                      {isLoadingRegister ? 'Creating...' : 'Confirm'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          </motion.div>

          {/* Register Form */}
          <motion.div
            className="w-1/2 h-full flex items-center justify-center p-8 bg-card absolute"
            variants={slideVariants}
            animate={isRegister ? 'initial' : 'slideLeft'}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ 
              left: isRegister ? '0%' : '-50%',
              zIndex: isRegister ? 2 : 1 
            }}
          >
            <motion.div 
              className="w-full max-w-md"
              variants={fadeVariants}
              animate={isRegister ? 'visible' : 'hidden'}
              transition={{ duration: 0.4, delay: isRegister ? 0.3 : 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="mb-2">Create Account</h1>
                <p className="text-muted-foreground">Join Take Two Labs today</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        className="pl-10"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone"
                      className="pl-10"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      className="pl-10 pr-10"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      className="pl-10 pr-10"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoadingRegister}>
                  {isLoadingRegister ? 'Validating...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsRegister(false)}
                  >
                    Already have an account? <span className="text-primary">Sign in</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>

          {/* Image / Loader Container */}
          <div className="w-1/2 h-full relative overflow-hidden ml-auto">
            {
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                <img src={logo} alt="TAKETWO" className="w-3/4 max-w-[420px] h-auto" />
                <div className="animated-title mt-8">
                  <div className="text-top">
                    <div>
                      <span>TAKETWO </span>
                      <span style={{fontSize: '3vmin'}}>SHOE CLEANING EXPERT</span>
                    </div>
                  </div>
                  <div className="text-bottom">
                    <div>SINCE 2019</div>
                  </div>
                </div>
                <style jsx>{`
.animated-title {
  color: #939393ff;
  font-family: Roboto, Arial, sans-serif;
  height: auto;
  width: 90vmin;
  text-align: center;
  position: relative;
}
.animated-title > div { height: auto; overflow: hidden; width: 100%; }
.animated-title > div div { font-size: 6vmin; padding: 1vmin 0; position: relative; }
.animated-title > div div span { display: block; }
.animated-title > div.text-top { display: flex; flex-direction: column; align-items: center; margin-bottom: 1rem; position: relative; }
.animated-title > div.text-top::after { content: ""; display: block; width: 50%; border-bottom: 2px solid #6c6c6cff; margin-top: 0.5rem; }
.animated-title > div.text-top div { animation: showTopText 1s; animation-delay: 0.5s; animation-fill-mode: forwards; transform: translate(0, 100%); }
.animated-title > div.text-top div span:first-child { color: #000000ff; }
.animated-title > div.text-bottom div { animation: showBottomText 0.5s; animation-delay: 1.75s; animation-fill-mode: forwards; transform: translate(0, -100%); font-size: 2vmin; }
@keyframes showTopText { 0% { transform: translate3d(0, 100%, 0);} 40%,60% { transform: translate3d(0, 50%, 0);} 100% { transform: translate3d(0, 0, 0);} }
@keyframes showBottomText { 0% { transform: translate3d(0, -100%, 0);} 100% { transform: translate3d(0, 0, 0);} }
                `}</style>
              </div>
            }
          </div>


        </div>
      </Card>
    </div>
  );
}