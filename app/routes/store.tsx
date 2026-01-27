import Header from "../components/Header";
import Footer from "../components/Footer";

export default function StorePage() {
  const storeItems = [
    {
      id: 1,
      name: "Starter Bundle",
      description: "Perfect for new players",
      price: "$9.99",
      items: ["10,000 Gold Coins", "Welcome Kit", "Rank Boost"],
      icon: "🎁",
    },
    {
      id: 2,
      name: "Premium Bundle",
      description: "For the serious players",
      price: "$19.99",
      items: ["50,000 Gold Coins", "Premium Cosmetics", "VIP Status"],
      icon: "👑",
    },
    {
      id: 3,
      name: "Ultimate Bundle",
      description: "The best value",
      price: "$49.99",
      items: [
        "250,000 Gold Coins",
        "All Cosmetics",
        "Lifetime VIP",
        "Custom Title",
      ],
      icon: "💎",
    },
    {
      id: 4,
      name: "Battle Pass",
      description: "Seasonal progression",
      price: "$4.99",
      items: ["50 Tiers", "Exclusive Rewards", "XP Boost"],
      icon: "🎯",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 text-white">
      <Header type="store" />

      {/* Header Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 pt-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 text-orange-400">
            🛍️ Mystic Network Store
          </h1>
          <p className="text-xl text-orange-200">
            Enhance your gameplay with exclusive items and cosmetics
          </p>
        </div>
      </section>

      {/* Store Items Grid */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-slate-300 mb-4">{item.description}</p>

                <div className="mb-6 space-y-2">
                  {item.items.map((itemName, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span>
                      <span className="text-slate-300">{itemName}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-orange-400">
                    {item.price}
                  </span>
                </div>

                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all duration-200">
                  Purchase Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-orange-400">
            ℹ️ Store Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-3">
                ✅ Secure Payment
              </h3>
              <p className="text-slate-300">
                All transactions are secure and processed through verified payment gateways.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-3">
                ⚡ Instant Delivery
              </h3>
              <p className="text-slate-300">
                Items are delivered to your account instantly after purchase completion.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-3">
                🛡️ Money-Back Guarantee
              </h3>
              <p className="text-slate-300">
                If you have issues, contact support for a 30-day refund guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
