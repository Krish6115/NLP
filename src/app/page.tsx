"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { 
  Menu, 
  X, 
  Send, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Building,
  ChevronDown,
  PlusCircle,
  Lock
} from 'lucide-react';

// Utility function for class names
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// --- NEW & IMPROVED COMPONENTS ---

// 1. NEW, IMPROVED Stethoscope Icon Component
const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <path
      d="M17.84 2.16a.75.75 0 0 0-1.06 0l-.71.71a.75.75 0 0 0 0 1.06l.71.71a.75.75 0 0 0 1.06 0l.71-.71a.75.75 0 0 0 0-1.06l-.71-.71Zm-6.72 6.72a.75.75 0 0 0-1.06 0l-.71.71a.75.75 0 0 0 0 1.06l.71.71a.75.75 0 0 0 1.06 0l.71-.71a.75.75 0 0 0 0-1.06l-.71-.71ZM12 21.25a9.25 9.25 0 1 0 0-18.5 9.25 9.25 0 0 0 0 18.5ZM12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16ZM12 14.25a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Z"
    />
  </svg>
);


// 2. Enhanced Custom Cursor
const CustomCursor: React.FC = () => {
    const mouse = { x: useSpring(0, { stiffness: 300, damping: 25 }), y: useSpring(0, { stiffness: 300, damping: 25 }) };
    const smallDot = { x: useSpring(0, { stiffness: 150, damping: 20 }), y: useSpring(0, { stiffness: 150, damping: 20 }) };
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x.set(e.clientX);
            mouse.y.set(e.clientY);
            smallDot.x.set(e.clientX);
            smallDot.y.set(e.clientY);
            setIsVisible(true);
        };
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", handleMouseMove);
        document.documentElement.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [mouse.x, mouse.y, smallDot.x, smallDot.y]);
    
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none z-[9999]">
                    <motion.div
                        className="absolute w-12 h-12 rounded-full bg-sky-400/20 border border-sky-400/50"
                        style={{ x: mouse.x, y: mouse.y, translateX: '-50%', translateY: '-50%' }}
                    />
                    <motion.div
                        className="absolute w-2 h-2 rounded-full bg-blue-600"
                        style={{ x: smallDot.x, y: smallDot.y, translateX: '-50%', translateY: '-50%' }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};


// 3. Interactive Background (Unchanged)
const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const dotsRef = useRef<any[]>([]);
    const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
    const DOT_SPACING = 30;
    const BASE_OPACITY_MIN = 0.1;
    const BASE_OPACITY_MAX = 0.3;
    const BASE_RADIUS = 1;
    const INTERACTION_RADIUS = 100;
    const handleMouseMove = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePositionRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }, []);
    const createDots = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { width, height } = canvas;
        const newDots: any[] = [];
        const cols = Math.ceil(width / DOT_SPACING);
        const rows = Math.ceil(height / DOT_SPACING);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * DOT_SPACING + DOT_SPACING / 2;
                const y = j * DOT_SPACING + DOT_SPACING / 2;
                const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
                newDots.push({
                    x, y, baseColor: 'rgba(135, 206, 235, 1)', targetOpacity: baseOpacity,
                    currentOpacity: baseOpacity, opacitySpeed: (Math.random() * 0.005) + 0.002,
                    baseRadius: BASE_RADIUS, currentRadius: BASE_RADIUS,
                });
            }
        }
        dotsRef.current = newDots;
    }, []);
    const animateDots = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const { x: mouseX, y: mouseY } = mousePositionRef.current;
        dotsRef.current.forEach((dot) => {
            let interactionFactor = 0;
            if (mouseX !== null && mouseY !== null) {
                const dx = dot.x - mouseX;
                const dy = dot.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < INTERACTION_RADIUS) {
                    interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
                    interactionFactor = interactionFactor * interactionFactor;
                }
            }
            const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * 0.7);
            dot.currentRadius = dot.baseRadius + interactionFactor * 2;
            ctx.beginPath();
            ctx.fillStyle = `rgba(135, 206, 235, ${finalOpacity})`;
            ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        animationFrameId.current = requestAnimationFrame(animateDots);
    }, []);
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createDots();
    }, [createDots]);
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId.current = requestAnimationFrame(animateDots);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [handleResize, handleMouseMove, animateDots]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
        />
    );
};

// 4. Updated Header Component
const Header: React.FC<{ onSignInClick: () => void; onSignUpClick: () => void }> = ({ onSignInClick, onSignUpClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-lg border-b border-sky-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2 cursor-pointer">
               <StethoscopeIcon className="w-7 h-7 text-sky-600" />
              <span className="text-xl font-bold text-gray-900">GuideDoc</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors">Features</a>
            <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors">About</a>
            <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors">Contact</a>
          </nav>

          {/* Auth Buttons - ALIGNMENT FIXED */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignInClick}
              className="bg-transparent text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-sky-100/50 transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUpClick}
              className="bg-sky-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-sky-700 shadow-md hover:shadow-lg transition-all"
            >
              Sign Up
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-sky-200/50 py-4"
            >
              <nav className="flex flex-col space-y-4">
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors px-4 py-2 rounded-md hover:bg-sky-100/50">Features</a>
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors px-4 py-2 rounded-md hover:bg-sky-100/50">About</a>
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors px-4 py-2 rounded-md hover:bg-sky-100/50">Contact</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};


// 5. Updated Chat Interface Component
const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* AI Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <StethoscopeIcon className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hi, I'm GuideDoc
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            I'm your private and personal AI doctor, designed to empower healthcare professionals with AI-Driven Clinical Intelligence. My service is fast, free, and evidence-based.
          </p>
          
          <p className="text-xl text-gray-800 font-medium">
            What can I help you with today?
          </p>
        </motion.div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-sky-200/50 p-4"
        >
          <div className="relative flex items-center space-x-4">
            <input type="file" ref={fileInputRef} className="hidden" />
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              onClick={handleFileUploadClick}
              className="p-2 text-gray-500 hover:text-sky-600 transition-colors rounded-full hover:bg-sky-100/50"
              aria-label="Upload file"
            >
              <PlusCircle className="w-6 h-6" />
            </motion.button>
            <textarea
              value={message}
              onChange={handleInputChange}
              placeholder="Ask me anything about your health..."
              className="flex-1 h-16 p-4 bg-transparent border-none resize-none focus:outline-none placeholder-gray-500 text-gray-800"
            />
            {/* BUTTON TEXT CHANGED TO "SEND" */}
             <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!message.trim()}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm rounded-xl font-semibold transition-all",
                  message.trim()
                    ? "bg-sky-600 text-white hover:bg-sky-700 shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


// 6. Updated Auth Modals
const SignInModal: React.FC<{ isOpen: boolean; onClose: () => void; onSwitchToSignUp: () => void }> = ({ isOpen, onClose, onSwitchToSignUp }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} 
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl max-w-sm w-full p-8"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to GuideDoc</h2>
                    <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
                </div>
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            {/* INPUT TEXT COLOR FIXED */}
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-sky-200/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            {/* INPUT TEXT COLOR FIXED */}
                            <input
                                type={'password'}
                                className="w-full pl-10 pr-12 py-3 border border-sky-200/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-sky-600 hover:text-sky-700">
                            Forgot Password?
                        </a>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                    >
                        Sign In
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-gray-600">Don't have an account? </span>
                    <button onClick={onSwitchToSignUp} className="text-sky-600 hover:text-sky-700 font-medium">
                        Sign Up
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const SignUpModal: React.FC<{ isOpen: boolean; onClose: () => void; onSwitchToSignIn: () => void }> = ({ isOpen, onClose, onSwitchToSignIn }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} 
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl max-w-sm w-full p-8 max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your GuideDoc Account</h2>
                    <p className="text-gray-600">Join thousands of healthcare professionals</p>
                </div>
                 <form className="space-y-4">
                   {/* INPUT TEXT COLOR FIXED ON ALL FIELDS */}
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                       <div className="relative">
                           <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                           <input type="text" className="w-full pl-10 pr-4 py-3 border border-sky-200/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-500" placeholder="Enter your full name" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                       <div className="relative">
                           <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                           <input type="email" className="w-full pl-10 pr-4 py-3 border border-sky-200/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-500" placeholder="Enter your email" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                       <div className="relative">
                           <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                           <input type="password" className="w-full pl-10 pr-12 py-3 border border-sky-200/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-500" placeholder="Create a password" />
                           <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><Eye className="w-5 h-5" /></button>
                       </div>
                   </div>
                    <div className="flex items-start space-x-3">
                       <input type="checkbox" className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mt-1" />
                       <span className="text-sm text-gray-700">I agree to the <a href="#" className="text-sky-600 hover:text-sky-700">Terms</a> and <a href="#" className="text-sky-600 hover:text-sky-700">Privacy Policy</a></span>
                   </div>
                   <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       type="submit"
                       className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                   >
                       Sign Up
                   </motion.button>
               </form>
                <div className="mt-6 text-center">
                    <span className="text-gray-600">Already have an account? </span>
                    <button onClick={onSwitchToSignIn} className="text-sky-600 hover:text-sky-700 font-medium">
                        Sign In
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const GuideDocApp: React.FC = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CustomCursor />
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
        <ChatInterface />
      </div>

      <AnimatePresence>
        {showSignIn && (
          <SignInModal
            isOpen={showSignIn}
            onClose={handleCloseModals}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignUp && (
          <SignUpModal
            isOpen={showSignUp}
            onClose={handleCloseModals}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideDocApp;