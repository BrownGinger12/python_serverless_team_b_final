import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Main App Component
const LoginPage: React.FC = () => {
    const { userId } = useAuth();

    const navigate = useNavigate()

    useEffect(() => {
        if (userId !== null) {
            navigate("/")
        }
    }, [])

    return (
        <div className="min-h-[100vh] bg-gray-100">
            <Header />
            <main className="flex h-[80vh] justify-center py-8">
                <AuthContainer />
            </main>
            <Footer />
        </div>
    );
};

// Header Component
const Header: React.FC = () => {
    return (
        <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-4 flex items-center">
                <div className="text-2xl font-bold text-yellow-500">
                    Pc<span className="text-black">Express</span>
                </div>
            </div>
        </header>
    );
};

// Footer Component
const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="mt-8 text-center text-gray-400">
                    <p>© 2025 PC Express. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// Auth Container Component
const AuthContainer: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="w-full h-full max-w-md">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-xl font-bold mb-6 text-center">
                    {isLogin ? "Sign-In" : "Create Account"}
                </h2>

                {isLogin ? <LoginForm /> : <SignupForm />}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 text-center">
                        {isLogin ? "New to PcExpress?" : "Already have an account?"}
                    </div>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded focus:outline-none"
                    >
                        {isLogin ? "Create your PcExpress account" : "Sign in to your account"}
                    </button>
                </div>
            </div>

            <div className="text-xs text-center text-gray-600 mt-4">
                By continuing, you agree to PcExpress's{" "}
                <a href="#" className="text-blue-600">
                    Conditions of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600">
                    Privacy Notice
                </a>
                .
            </div>
        </div>
    );
};

// Login Form Component
const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setUserId } = useAuth();

    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert("Both email and password are required.");
            return;
        }



        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userid = userCredential.user.uid;

            setUserId(userid)
            navigate("/")
            alert("User signed in");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <form>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                />
            </div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="password">
                        Password
                    </label>
                    <a className="inline-block align-baseline text-sm text-blue-600 hover:text-blue-800" href="#">
                        Forgot Password?
                    </a>
                </div>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                />
            </div>
            <div className="flex items-center mb-4">
                <input id="remember" type="checkbox" className="w-4 h-4 text-yellow-500" />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    Keep me signed in
                </label>
            </div>
            <button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={(e) => {
                    handleLogin(e)
                }}
            >
                Sign In
            </button>
        </form>
    );
};

// Signup Form Component
const SignupForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            alert("Account created!");
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            alert("Error signing up.")
        }
    };

    return (
        <form>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">
                    Email
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    placeholder="Enter your email"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
                    Password
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="signup-password"
                    value={password}
                    type="password"
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    placeholder="At least 6 characters"
                />
                <p className="text-xs text-gray-600 mt-1">
                    Passwords must be at least 6 characters.
                </p>
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password-confirm">
                    Re-enter password
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                    }}
                    placeholder="Re-enter your password"
                />
            </div>
            <button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={(e) => {
                    if (email.trim() && password.trim() && confirmPassword.trim()) {
                        if (password.length < 6) {
                            alert("Password must be at least 6 characters.")
                        }
                        else if (confirmPassword === password) {
                            handleSignup(e)
                        }
                        else {
                            alert("Password does not match")
                        }
                    }
                    else {
                        alert("Fill up all the fields.")
                    }

                }}
            >
                Create Account
            </button>
        </form>
    );
};

export default LoginPage;