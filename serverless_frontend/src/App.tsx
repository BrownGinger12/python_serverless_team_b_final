import "./App.css";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import NotFound from "./components/NotFound";
import Admin from "./components/Admin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketPage from "./components/TicketPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/admin" element={<Admin />} />
				<Route path="/" element={<MainPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/ticket" element={<TicketPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
