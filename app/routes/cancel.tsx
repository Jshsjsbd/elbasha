import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router";

export default function CancelPage() {
  return (
    <div className="w-full bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 text-white min-h-screen flex flex-col">
      <Header type="store" />

      <div className="flex-grow flex items-center justify-center pt-32">
        <div className="text-center max-w-2xl px-4">
          <div className="text-7xl mb-6">❌</div>
          <h1 className="text-5xl font-bold mb-4 text-red-400">
            Payment Cancelled
          </h1>
          <p className="text-xl text-orange-200 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="bg-slate-800 rounded-lg p-6 border border-orange-500 mb-8">
            <p className="text-slate-300 mb-4">
              If you experienced any issues during checkout, please try again or
              contact our support team on Discord for assistance.
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/store"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Back to Store
            </Link>
            <a
              href="https://discord.gg/mysticnetwork"
              className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Support Discord
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
