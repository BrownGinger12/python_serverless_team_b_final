import { onAuthStateChanged } from "firebase/auth";
import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { auth } from "../firebase/firebase";

interface AuthContextType {
	userId: string | null;
	setUserId: (id: string | null) => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const auth_state = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserId(user.uid);
			}

			setIsLoading(false);
		});

		return auth_state;
	}, []);

	return (
		<AuthContext.Provider value={{ userId, setUserId, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
