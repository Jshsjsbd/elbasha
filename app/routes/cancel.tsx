import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
export default function Cancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
        <XCircle className="mx-auto mb-4 text-yellow-400" size={64} />
        <h2 className="text-3xl font-bold mb-4">Payment Cancelled</h2>
        <p className="text-gray-300 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div className="space-y-3">
          <Link
            to="/store"
            className="block w-full bg-gradient-to-r from-green-500 to-blue-500 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Back to Store
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}