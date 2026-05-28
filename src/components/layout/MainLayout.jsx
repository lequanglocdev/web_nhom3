import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
// import ChatbotWidget from "../../pages/admin/Chatbotwidget";
import AdminChat from "../../pages/admin/AdminChat";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <AdminChat />
      <Footer />
    </>
  );
}
