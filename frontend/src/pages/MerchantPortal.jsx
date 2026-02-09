import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { virtualCardAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

function MerchantPortal() {
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    // Load recent transactions from localStorage
    const saved = localStorage.getItem('merchantTransactions');
    if (saved) {
      setRecentTransactions(JSON.parse(saved));
    }
  }, []);

  const startScanning = () => {
    if (!merchantName || !amount || parseFloat(amount) <= 0) {
      setError('Please enter merchant name and valid amount');
      return;
    }

    setError('');
    setScanning(true);

    // Initialize scanner
    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    html5QrcodeScannerRef.current.render(
      (decodedText) => {
        // QR Code scanned successfully
        processPayment(decodedText);
        stopScanning();
      },
      (error) => {
        // Scanning errors (ignore these, they're constant)
      }
    );
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
  };

  const processPayment = async (token) => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await virtualCardAPI.processPayment({
        token,
        amount: parseFloat(amount),
        merchantName,
      });

      setSuccess(`✓ Payment successful! ${formatCurrency(response.data.transaction.amount)} received`);

      // Add to recent transactions
      const transaction = {
        amount: response.data.transaction.amount,
        merchantName,
        timestamp: new Date().toISOString(),
      };

      const updated = [transaction, ...recentTransactions.slice(0, 9)];
      setRecentTransactions(updated);
      localStorage.setItem('merchantTransactions', JSON.stringify(updated));

      // Reset form
      setAmount('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white mb-2">NexBank Merchant</h1>
          <p className="text-gray-600 dark:text-gray-400">Payment Terminal</p>
        </div>

        {/* Setup Form */}
        {!scanning && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-800 mb-6 animate-scale-in">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition"
                  placeholder="Coffee Shop"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Amount (N$) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-2xl font-bold">N$</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="w-full pl-20 pr-4 py-4 bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-black dark:text-white transition text-3xl font-black"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                onClick={startScanning}
                disabled={!merchantName || !amount}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl text-xl flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                </svg>
                Start Scanning QR Code
              </button>
            </div>
          </div>
        )}

        {/* Scanner */}
        {scanning && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-800 mb-6 animate-scale-in">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-black dark:text-white mb-2">
                Scanning for QR Code...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Point camera at customer's phone screen
              </p>
              <p className="text-3xl font-black text-amber-600 mt-4">
                {formatCurrency(amount)}
              </p>
            </div>

            <div id="qr-reader" className="mb-6"></div>

            <button
              onClick={stopScanning}
              className="w-full px-6 py-3 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-950/50 transition"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-12 border border-gray-200 dark:border-neutral-800 mb-6 text-center animate-scale-in">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold text-black dark:text-white">Processing payment...</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-6 animate-fade-in flex items-center gap-3">
            <svg className="w-8 h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-lg">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-6 animate-fade-in flex items-center gap-3">
            <svg className="w-8 h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-lg">{error}</span>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && !scanning && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-800 animate-scale-in">
            <h3 className="text-2xl font-black text-black dark:text-white mb-6">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">{tx.merchantName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-green-600 dark:text-green-400">
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantPortal;