import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/RegisterPage";
import Login from "./pages/LoginPage";
import Watchlist from "./pages/Watchlist";
import ReviewPage from "./pages/UserReviewPage";
import AdminReviewsPage from "./pages/AdminReviewPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/review/:gameId" element={<ReviewPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      </Routes>
    </Router>
  );
}

export default App;