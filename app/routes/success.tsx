import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
export default function Success() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');
  useEffect(() => {
    if (sessionId) {
      // Optionally verify the purchase with your backend
      setTimeout(() => {
        setStatus('success');
      }, 1500);
    } else {
      setStatus('error');
    }
  }, [sessionId]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
        {status === 'loading' && (
          <>
            <Loader className="mx-auto mb-4 animate-spin text-blue-400" size={64} />
            <h2 className="text-2xl font-bold mb-2">Processing...</h2>
            <p className="text-gray-400">Verifying your purchase</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
            <h2 className="text-3xl font-bold mb-4">Purchase Successful!</h2>
            <p className="text-gray-300 mb-6">
              Your items will be delivered to your Minecraft account within a few moments.
              <br />
              <span className="text-green-400 font-semibold">Thank you for your purchase!</span>
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
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We couldn't verify your purchase. Please contact support if you were charged.
            </p>
            <Link
              to="/store"
              className="block w-full bg-gradient-to-r from-green-500 to-blue-500 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
            >
              Back to Store
            </Link>
          </>
        )}
      </div>
    </div>
  );
}