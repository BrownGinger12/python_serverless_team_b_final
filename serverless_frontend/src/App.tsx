import "./App.css";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import NotFound from "./components/NotFound";
import Sidebar from "./components/SideBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
	return (
		<Router>
			<Routes>
				<Route
					path="/admin"
					element={
						<Sidebar />
					}
				/>
				<Route path="/" element={<MainPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
