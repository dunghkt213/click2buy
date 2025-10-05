/* global use, db */

// =======================
// Chọn Database
// =======================
use('ecommerceDB');

// =======================
// Collection: USERS
// =======================
db.createCollection("users");
db.users.insertMany([
  {
    username: "john_doe",
    email: "john@example.com",
    passwordHash: "hashed_password",
    role: "customer", // customer | admin
    createdAt: new Date(),
    updatedAt: new Date(),
    address: [
      {
        street: "123 Main St",
        city: "Hanoi",
        country: "Vietnam",
        zip: "100000"
      }
    ]
  }
]);
// Index cho user
db.users.createIndex({ email: 1 }, { unique: true });

// =======================
// Collection: CATEGORIES
// =======================
db.createCollection("categories");
const categoryIds = db.categories.insertMany([
  { name: "Điện thoại", slug: "dien-thoai", createdAt: new Date() },
  { name: "Áo quần", slug: "ao-quan", createdAt: new Date() }
]).insertedIds;
// Index cho category
db.categories.createIndex({ slug: 1 }, { unique: true });

// =======================
// Collection: PRODUCTS
// =======================
db.createCollection("products");
db.products.insertMany([
  {
    name: "iPhone 15 Pro",
    description: "Điện thoại Apple 2023",
    price: 1200,
    stock: 50,
    categoryId: categoryIds[0], // tham chiếu category Điện thoại
    brand: "Apple",
    attributes: { color: "Đen", size: "128GB" },
    ratingAvg: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Áo thun nam",
    description: "Cotton 100%",
    price: 20,
    stock: 200,
    categoryId: categoryIds[1], // tham chiếu category Áo quần
    brand: "Canifa",
    attributes: { color: "Trắng", size: "M" },
    ratingAvg: 4.2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
// Index cho filter
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ "attributes.color": 1 });
db.products.createIndex({ "attributes.size": 1 });
db.products.createIndex({ ratingAvg: -1 });

// =======================
// Collection: ORDERS
// =======================
db.createCollection("orders");
db.orders.insertOne({
  userId: db.users.findOne()._id, // tham chiếu user
  items: [
    { productId: db.products.findOne({ name: "iPhone 15 Pro" })._id, quantity: 2, price: 1200 },
    { productId: db.products.findOne({ name: "Áo thun nam" })._id, quantity: 1, price: 20 }
  ],
  totalAmount: 2420,
  status: "pending", // pending | paid | shipped | delivered | cancelled
  createdAt: new Date(),
  updatedAt: new Date()
});
// Index cho orders
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });

// =======================
// Collection: PAYMENTS
// =======================
db.createCollection("payments");
db.payments.insertOne({
  orderId: db.orders.findOne()._id,
  method: "credit_card", // credit_card | paypal | cod
  amount: 2420,
  status: "success",
  transactionDate: new Date()
});

// =======================
// Collection: REVIEWS
// =======================
db.createCollection("reviews");
db.reviews.insertOne({
  productId: db.products.findOne({ name: "iPhone 15 Pro" })._id,
  userId: db.users.findOne()._id,
  rating: 5,
  comment: "Sản phẩm quá chất lượng!",
  createdAt: new Date()
});
// Index cho reviews
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ rating: -1 });


// =======================
// Demo filter query
// =======================
// Tìm sản phẩm Apple, màu đen, giá từ 500 đến 1500
const filteredProducts = db.products.find({
  brand: "Apple",
  price: { $gte: 500, $lte: 1500 },
  "attributes.color": "Đen"
}).toArray();

console.log("Kết quả filter:", filteredProducts);
