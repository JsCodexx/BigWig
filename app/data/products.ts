export const products = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music enthusiasts and professionals.",
      price: 299.99,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      rating: 4.5,
      stock: 50,
      features: ["Active Noise Cancellation", "40h Battery Life", "Premium Sound Quality"]
    },
    {
      id: "2",
      name: "Ergonomic Office Chair",
      description: "Comfortable ergonomic office chair with lumbar support and adjustable features for optimal comfort during long work hours.",
      price: 249.99,
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1505843490578-27dedd1a6c9c?w=500&q=80",
      rating: 4.8,
      stock: 30,
      features: ["Lumbar Support", "Adjustable Height", "360° Swivel"]
    },
    {
      id: "3",
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracker with heart rate monitoring, GPS, and smartphone notifications.",
      price: 199.99,
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
      rating: 4.3,
      stock: 75,
      features: ["Heart Rate Monitor", "GPS Tracking", "Water Resistant"]
    },
    {
      id: "4",
      name: "Modern Coffee Table",
      description: "Sleek and modern coffee table with tempered glass top and wooden base.",
      price: 179.99,
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=500&q=80",
      rating: 4.6,
      stock: 20,
      features: ["Tempered Glass", "Solid Wood Base", "Easy Assembly"]
    }
  ] as const;