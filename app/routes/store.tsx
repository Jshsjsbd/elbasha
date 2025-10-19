import { useState } from 'react';
import { ShoppingCart, Trash2, Crown, Zap, Star, Shield, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Store() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    minecraftName: '',
    email: '',
  });

  const products = [
    {
      id: 1,
      name: 'VIP Rank',
      price: 9.99,
      icon: <Star className="w-12 h-12" />,
      color: 'from-yellow-400 to-yellow-600',
      features: ['Custom prefix', 'Join full server', '2x Daily rewards', 'Access to /fly']
    },
    {
      id: 2,
      name: 'MVP Rank',
      price: 19.99,
      icon: <Crown className="w-12 h-12" />,
      color: 'from-purple-400 to-purple-600',
      features: ['All VIP features', 'Colored chat', '3x Daily rewards', 'Pet cosmetics', 'Priority support']
    },
    {
      id: 3,
      name: 'LEGEND Rank',
      price: 34.99,
      icon: <Zap className="w-12 h-12" />,
      color: 'from-red-400 to-orange-600',
      features: ['All MVP features', 'Rainbow name', '5x Daily rewards', 'Exclusive kit', 'Private server access']
    },
    {
      id: 4,
      name: 'Starter Kit',
      price: 4.99,
      icon: <Package className="w-12 h-12" />,
      color: 'from-green-400 to-green-600',
      features: ['Diamond armor set', 'Enchanted sword', '64 Golden apples', '1000 in-game coins']
    },
    {
      id: 5,
      name: 'Protection Bundle',
      price: 7.99,
      icon: <Shield className="w-12 h-12" />,
      color: 'from-blue-400 to-blue-600',
      features: ['30-day claim protection', 'Anti-grief shield', 'Rollback protection', 'Priority grief reports']
    }
  ];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!checkoutData.minecraftName || !checkoutData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minecraftName: checkoutData.minecraftName,
          email: checkoutData.email,
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Server Store
          </h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-gradient-to-r from-green-500 to-blue-500 px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            <ShoppingCart className="inline mr-2" size={20} />
            Cart ({cart.length})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!showCart && !showCheckout && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                Upgrade Your Experience
              </h2>
              <p className="text-gray-400 text-lg">
                Purchase ranks, kits, and exclusive items for the server
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:scale-105"
                >
                  <div className={`bg-gradient-to-br ${product.color} p-6 flex justify-center items-center`}>
                    <div className="text-white">
                      {product.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-3xl font-bold text-green-400 mb-4">
                      ${product.price}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showCart && !showCheckout && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Store
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 bg-opacity-50 rounded-xl">
                <ShoppingCart className="mx-auto mb-4 text-gray-600" size={64} />
                <p className="text-gray-400 text-xl">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="bg-gray-800 bg-opacity-50 rounded-xl p-6 flex items-center justify-between border border-gray-700"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`bg-gradient-to-br ${item.color} p-4 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="text-green-400 font-semibold">${item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-xl font-bold hover:text-green-400 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-xl font-bold hover:text-green-400 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xl font-bold w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center text-2xl font-bold mb-6">
                    <span>Total:</span>
                    <span className="text-green-400">${getTotal()}</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {showCheckout && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Cart
              </button>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 border border-gray-700">
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Minecraft Username *</label>
                <input
                  type="text"
                  value={checkoutData.minecraftName}
                  onChange={(e) => setCheckoutData({...checkoutData, minecraftName: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors text-white"
                  placeholder="Steve"
                />
                <p className="text-gray-400 text-sm mt-1">Items will be delivered to this account</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  value={checkoutData.email}
                  onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors text-white"
                  placeholder="steve@minecraft.net"
                />
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-400">${getTotal()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Continue to Payment - $${getTotal()}`}
              </button>

              <p className="text-gray-400 text-sm text-center mt-4">
                🔒 Secure payment processing via Stripe
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}