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
    phone: "0123456789",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    address: [
      {
        name: "John Doe",
        phone: "0123456789",
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
  { name: "Điện thoại", slug: "dien-thoai", createdAt: new Date(), updatedAt: new Date() },
  { name: "Áo quần", slug: "ao-quan", createdAt: new Date(), updatedAt: new Date() },
  { name: "Apple", slug: "apple", createdAt: new Date(), updatedAt: new Date() }
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
    salePrice: 1100,
    stock: 50,
    isActive: true,
    categoryIds: [categoryIds[0], categoryIds[2]], // Điện thoại + Apple
    brand: "Apple",
    attributes: { color: "Đen", size: "128GB" },
    images: ["iphone15-front.jpg", "iphone15-back.jpg"],
    ratingAvg: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Áo thun nam",
    description: "Cotton 100%",
    price: 20,
    salePrice: 18,
    stock: 200,
    isActive: true,
    categoryIds: [categoryIds[1]], // Áo quần
    brand: "Canifa",
    attributes: { color: "Trắng", size: "M" },
    images: ["aothun1.jpg", "aothun2.jpg"],
    ratingAvg: 4.2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
// Index cho filter
db.products.createIndex({ categoryIds: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ "attributes.color": 1 });
db.products.createIndex({ "attributes.size": 1 });
db.products.createIndex({ ratingAvg: -1 });
// Index text để search theo tên/mô tả
db.products.createIndex({ name: "text", description: "text" });

// =======================
// Collection: ORDERS
// =======================
db.createCollection("orders");
const iphone = db.products.findOne({ name: "iPhone 15 Pro" });
const tshirt = db.products.findOne({ name: "Áo thun nam" });
const user = db.users.findOne();

db.orders.insertOne({
  userId: user._id,
  items: [
    { productId: iphone._id, quantity: 2, price: iphone.salePrice },
    { productId: tshirt._id, quantity: 1, price: tshirt.salePrice }
  ],
  totalAmount: (2 * iphone.salePrice) + (1 * tshirt.salePrice),
  status: "pending", // pending | shipped | delivered | cancelled
  paymentStatus: "paid", // pending | paid | failed
  shippingAddress: {
    name: "John Doe",
    phone: "0123456789",
    street: "123 Main St",
    city: "Hanoi",
    country: "Vietnam",
    zip: "100000"
  },
  shippingMethod: "GHN",
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
const order = db.orders.findOne();
db.payments.insertOne({
  orderId: order._id,
  method: "credit_card", // credit_card | paypal | cod
  amount: order.totalAmount,
  currency: "VND",
  transactionId: "TX123456",
  status: "success",
  transactionDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// =======================
// Collection: REVIEWS
// =======================
db.createCollection("reviews");
db.reviews.insertOne({
  productId: iphone._id,
  userId: user._id,
  rating: 5,
  comment: "Sản phẩm quá chất lượng!",
  isApproved: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
// Index cho reviews
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ rating: -1 });

// =======================
// Collection: CARTS
// =======================
db.createCollection("carts");
db.carts.insertOne({
  userId: user._id,
  items: [
    { productId: iphone._id, quantity: 1 },
    { productId: tshirt._id, quantity: 3 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
db.carts.createIndex({ userId: 1 });

// =======================
// Collection: WISHLISTS
// =======================
db.createCollection("wishlists");
db.wishlists.insertOne({
  userId: user._id,
  productIds: [iphone._id],
  createdAt: new Date(),
  updatedAt: new Date()
});
db.wishlists.createIndex({ userId: 1 });

// =======================
// Demo filter query cơ bản
// =======================
// Tìm sản phẩm Apple, màu đen, giá từ 500 đến 1500
const filteredProducts = db.products.find({
  brand: "Apple",
  price: { $gte: 500, $lte: 1500 },
  "attributes.color": "Đen",
  isActive: true
}).toArray();
console.log("Kết quả filter cơ bản:", filteredProducts);

// =======================
// Demo text search
// =======================
// Tìm sản phẩm có chữ "iPhone" trong tên/mô tả
const searchResult = db.products.find({ $text: { $search: "iPhone" } }).toArray();
console.log("Kết quả search text:", searchResult);

// =======================
// Demo filter nâng cao: phân trang + sort + join category
// =======================
// Ví dụ: lấy sản phẩm trong category "Áo quần", sort theo giá tăng dần, phân trang (page 1, limit 10)
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const pipeline = [
  { $match: { categoryIds: categoryIds[1], isActive: true } }, // filter theo category "Áo quần"
  {
    $lookup: { // join để lấy thông tin category
      from: "categories",
      localField: "categoryIds",
      foreignField: "_id",
      as: "categories"
    }
  },
  { $sort: { price: 1 } }, // sort theo giá tăng dần
  { $skip: skip },
  { $limit: limit }
];

const advancedFilter = db.products.aggregate(pipeline).toArray();
console.log("Kết quả filter nâng cao (phân trang + sort + join category):", advancedFilter);
