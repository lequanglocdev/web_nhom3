import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ChatWidget from "../common/ChatWidget";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>

      <ChatWidget />
      <Footer />
    </>
  );
}
