import './App.css'
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import Sidebar from './components/SideBar'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<div className="w-full h-[100vh] flex flex-row items-center justify-center">
          <Sidebar />
        </div>} />
        <Route path="/" element={
          <MainPage />
        } />

        <Route path="/login" element={
          <LoginPage />
        } />

      </Routes>
    </Router>
  )
}

export default App
