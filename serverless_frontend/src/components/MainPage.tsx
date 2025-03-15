import React, { useState, useEffect } from "react";
import axiosClient from "../client/AxiosClient";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { calculateFinalPrice } from "../utils/calculation";
import ProductCard from "./ProductCard";
import Loading from "./Loading";

declare global {
	interface Window {
		fcWidget?: any; // Declare Freshchat widget globally
	}
}

// Define types
export interface Product {
	id: string;
	name: string;
	brandName: string;
	category: string;
	price: number;
	stock: number;
	imagePath: string;
}

interface Order {
	id: string;
	productId: string;
	productName: string;
	price: number;
	quantity: number;
	totalPrice: number;
	user_id: string | null;
	date: string;
	status: "pending" | "out for delivery" | "delivered" | "cancelled";
}

interface Category {
	id: string;
	name: string;
}

const MainPage: React.FC = () => {
	// Categories
	const categories: Category[] = [
		{ id: "1", name: "All" },
		{ id: "2", name: "CPU" },
		{ id: "3", name: "GPU" },
		{ id: "4", name: "RAM" },
		{ id: "5", name: "Storage" },
		{ id: "6", name: "Motherboard" },
		{ id: "7", name: "Power Supply" },
		{ id: "8", name: "Case" },
		{ id: "9", name: "Cooling" },
		{ id: "10", name: "Peripherals" },
	];

	// Auth context
	const { userId, setUserId, isLoading } = useAuth();

	// Sample product data
	const [products, setProducts] = useState<Product[]>([]);

	// Quantity selection for products
	const [quantities, setQuantities] = useState<Record<string, number>>({});

	// Orders state
	const [orders, setOrders] = useState<Order[]>([]);

	// Search functionality
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filteredProducts, setFilteredProducts] =
		useState<Product[]>(products);

	// Category filter
	const [selectedCategory, setSelectedCategory] = useState<string>("");

	const [orderProduct, setOrderProduct] = useState<Order>();
	const [productSelected, setSelectedProduct] = useState<Product>();

	// Initialize quantities for all products
	useEffect(() => {
		const initialQuantities: Record<string, number> = {};
		products.forEach((product) => {
			initialQuantities[product.id] = 1; // Default quantity is 1
		});
		setQuantities(initialQuantities);
	}, []);

	// Filter products based on search term and category
	useEffect(() => {
		let result = products;

		if (searchTerm) {
			result = result.filter(
				(product) =>
					product.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.brandName
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		if (selectedCategory !== "All") {
			result = result.filter(
				(product) => product.category === selectedCategory
			);
		}

		setFilteredProducts(result);
	}, [searchTerm, selectedCategory, products]);

	// Handle quantity change
	const handleQuantityChange = (productId: string, newQuantity: number) => {
		// Get the product to check stock limits
		const product = products.find((p) => p.id === productId);

		if (product) {
			// Ensure quantity is within bounds (1 to available stock)
			const validQuantity = Math.max(
				1,
				Math.min(newQuantity, product.stock)
			);

			setQuantities({
				...quantities,
				[productId]: validQuantity,
			});
		}
	};

	const updateOrder = async (order_id: string, new_status: string) => {
		const response = await axiosClient.put(
			`/order/${order_id}`,
			{ order_status: new_status },
			{
				headers: {
					"Content-Type": "application/json",
				},
				withCredentials: false,
			}
		);

		console.log(response);
	};

	const addStocks = async (product_id: string, quantity: number) => {
		const response = await axiosClient.post(
			"/add_stocks",
			{ product_id: product_id, quantity: quantity },
			{
				headers: {
					"Content-Type": "application/json",
				},
				withCredentials: false,
			}
		);

		console.log(response);
	};

	const addOrder = async (order: Order, product: Product) => {
		if (!userId) {
			alert("Please sign in to place an order");
			navigate("/login");
			return;
		}

		const new_order = {
			order_id: order.id,
			product_name: order.productName,
			user_id: userId,
			product_id: order.productId,
			contact_number: contactNumber,
			quantity: order.quantity,
			total_price: order.totalPrice,
		};

		const response = await axiosClient.post("/post_order", new_order, {
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: false,
		});

		if (response.data.body.statusCode === 200) {
			alert("Order added.");

			if (orderProduct) {
				setOrders([...orders, orderProduct]);
			}

			const quantity = quantities[product.id] || 1;

			const updatedProducts = products.map((p) => {
				if (p.id === product.id) {
					return { ...p, stock: p.stock - quantity };
				}
				return p;
			});

			setProducts(updatedProducts);
			addStocks(product.id, -quantity);

			setQuantities({
				...quantities,
				[product.id]: 1,
			});
		}

		console.log(response);
	};

	// Order a product
	const handleOrder = (product: Product) => {
		if (!userId) {
			alert("Please sign in to place an order");
			navigate("/login");
			return;
		}

		const quantity = quantities[product.id] || 1;

		if (product.stock >= quantity && quantity > 0) {
			// Calculate the total price
			const totalPrice = calculateFinalPrice(product, quantity);

			// Create new order
			const newOrder: Order = {
				id: `ord-${Date.now()}`,
				productId: product.id,
				productName: product.name,
				price: product.price,
				quantity: quantity,
				totalPrice: totalPrice,
				user_id: userId,
				date: new Date().toLocaleDateString(),
				status: "pending",
			};

			// Add order to orders array
			setOrderProduct(newOrder);
			setSelectedProduct(product);
			setIsOpen(true);
		} else {
			alert("Sorry, not enough items in stock.");
		}
	};

	const getAllOrders = async () => {
		try {
			const response = await axiosClient.get("/get_orders");

			const order_data = response.data.data;

			return order_data;
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	};

	// Cancel an order
	const handleCancelOrder = (orderId: string) => {
		if (!userId) {
			alert("Please sign in to place an order");
			navigate("/login");
			return;
		}

		// Find the order
		const orderToCancel = orders.find((order) => order.id === orderId);

		if (orderToCancel) {
			// Update order status
			const updatedOrders: Order[] = orders.map((order) => {
				if (order.id === orderId) {
					return { ...order, status: "cancelled" };
				}
				return order;
			});

			// Restore product stock
			const updatedProducts = products.map((p) => {
				if (p.id === orderToCancel.productId) {
					return { ...p, stock: p.stock + orderToCancel.quantity };
				}
				return p;
			});

			updateOrder(orderId, "cancelled");
			addStocks(orderToCancel.productId, orderToCancel.quantity);
			setOrders(updatedOrders);
			setProducts(updatedProducts);

			alert("Order cancelled successfully!");
		}
	};

	const confirmOrder = () => {
		if (orderProduct && productSelected) {
			addOrder(orderProduct, productSelected);
			setContactNumber("");
			setIsOpen(false);
		}
	};

	const fetchOrders = async () => {
		const order_data = await getAllOrders(); // Await the async function

		console.log("Orders:", order_data);

		const mappedOrders = order_data.map((item: any) => ({
			id: item.order_id,
			productId: item.product_id,
			productName: item.product_name,
			quantity: item.quantity,
			totalPrice: item.total_price,
			date: item.datetime,
			user_id: item.user_id,
			status: item.order_status,
		}));

		let query = mappedOrders;

		if (userId !== null) {
			query = query.filter(
				(order: { user_id: string }) =>
					String(order.user_id).toLowerCase() ===
					String(userId).toLowerCase()
			);
		}

		setOrders(query);
	};

	const fetchProducts = async () => {
		const prod_data = await getAllProducts(); // Await the async function

		console.log("Products:", prod_data);

		const mappedProducts = prod_data.map((item: any) => ({
			id: item.product_id,
			name: item.product_name,
			category: item.category,
			brandName: item.brand_name,
			price: item.price,
			stock: item.quantity,
			imagePath: "",
		}));

		setProducts(mappedProducts);
	};

	const getAllProducts = async () => {
		try {
			const response = await axiosClient.get("/get_products");

			const prod_data = response.data.data;

			return prod_data;
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	};

	const [contactNumber, setContactNumber] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		setSelectedCategory("All");

		fetchOrders();
		fetchProducts();
		waitForFreshchat();
	}, []);

	const ChatWidget = () => {
		useEffect(() => {
			if (document.getElementById("chat-widget-script")) return; // Prevent duplicate scripts

			const script = document.createElement("script");
			script.src = "//in.fw-cdn.com/32305041/1244590.js";
			script.async = true;
			script.id = "chat-widget-script";
			script.setAttribute("chat", "true");
			script.setAttribute(
				"widgetId",
				"2b9629aa-c14f-41af-bdb7-f2e8ef77a230"
			);

			document.body.appendChild(script);

			script.onload = () => {
				console.log("Chat widget script loaded successfully.");
			};
		}, []);

		return <div id="chat-widget-container"></div>;
	};

	const waitForFreshchat = async (timeout = 10000, interval = 500) => {
		const startTime = Date.now();
		while (!window.fcWidget) {
			if (Date.now() - startTime > timeout) {
				console.error(
					"❌ Freshchat widget failed to load within timeout."
				);
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, interval));
		}
		console.log("✅ Freshchat widget fully initialized.");
		window.fcWidget.user.clear();
		setUserProperty();
	};

	const setUserProperty = () => {
		if ((window as any).fcWidget) {
			(window as any).fcWidget.user.setProperties({
				firstName: userId,
			});

			(window as any).fcWidget.user
				.get()
				.then((userData: any) => {
					console.log("User Data:", userData);
				})
				.catch((error: any) => {
					console.error("Error fetching user properties:", error);
				});
		} else {
			console.error("Freshchat widget not loaded yet.");
		}
	};

	const handleLogout = async () => {
		const auth = getAuth();
		try {
			await signOut(auth);
			console.log("User signed out");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const removeChatWidget = () => {
		const script = document.getElementById("chat-widget-script");
		if (script && script.parentNode) {
			script.parentNode.removeChild(script);
			window.fcWidget.user.clear();
			console.log("Chat widget script removed.");
		}

		const chatFrames = document.querySelectorAll(
			"iframe, .chat-widget, .chat-container"
		);
		chatFrames.forEach((element) => element.remove());

		console.log("Chat widget elements removed.");
	};

	return (
		<div className="min-h-screen flex flex-col bg-gray-100 relative">
			{isLoading && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
					<Loading />
				</div>
			)}
			{/* Chat Widget */}
			{userId !== null && <ChatWidget />}
			{/* Header */}
			<header className="bg-gray-900 text-white p-4">
				<div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
					<div className="text-2xl font-bold mb-4 md:mb-0">
						PC Express
					</div>

					<div className="w-full md:w-2/5 flex mb-4 md:mb-0">
						<input
							type="text"
							placeholder="Search products..."
							className="w-full px-4 py-2 rounded-l focus:outline-none text-black"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-r">
							Search
						</button>
					</div>

					<div className="flex">
						{!isLoading &&
							(userId !== null ? (
								<button
									className="text-white mx-2 hover:text-yellow-400"
									onClick={() => {
										setUserId(null);
										removeChatWidget();
										navigate("/login");
										handleLogout();
									}}
								>
									Log out
								</button>
							) : (
								<Link
									to="/login"
									className="text-white mx-2 hover:text-yellow-400 underline"
								>
									Sign-in
								</Link>
							))}
					</div>
				</div>
			</header>

			{/* Navigation */}
			<nav className="bg-gray-800 text-white p-3 overflow-x-auto whitespace-nowrap">
				<div className="container mx-auto flex">
					{categories.map((category) => (
						<button
							key={category.id}
							className={`mr-6 hover:text-yellow-400 ${
								selectedCategory === category.name
									? "text-yellow-400"
									: ""
							}`}
							onClick={() =>
								setSelectedCategory(
									category.name === selectedCategory
										? ""
										: category.name
								)
							}
						>
							{category.name}
						</button>
					))}
				</div>
			</nav>

			{/* Main content */}
			<main className="container mx-auto py-8 px-4 flex-grow">
				<h2 className="text-2xl font-bold mb-6">
					{selectedCategory
						? `${selectedCategory} Products`
						: "All PC Components"}
				</h2>

				{/* Products grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<ProductCard
							product={product}
							quantities={quantities}
							handleQuantityChange={handleQuantityChange}
							handleOrder={handleOrder}
						/>
					))}
				</div>

				{/* Orders section */}
				{userId !== null && (
					<section id="orders" className="mt-12">
						<h2 className="text-2xl font-bold mb-6">Your Orders</h2>

						{orders.length > 0 ? (
							<div className="overflow-x-auto bg-white rounded-lg shadow">
								<table className="min-w-full">
									<thead>
										<tr className="bg-gray-100">
											<th className="py-3 px-4 text-left">
												Order ID
											</th>
											<th className="py-3 px-4 text-left">
												Product
											</th>
											<th className="py-3 px-4 text-left">
												Quantity
											</th>
											<th className="py-3 px-4 text-left">
												Total
											</th>
											<th className="py-3 px-4 text-left">
												Date
											</th>
											<th className="py-3 px-4 text-left">
												Status
											</th>
											<th className="py-3 px-4 text-left">
												Action
											</th>
										</tr>
									</thead>
									<tbody>
										{orders.map((order) => (
											<tr
												key={order.id}
												className="border-t"
											>
												<td className="py-3 px-4">
													{order.id}
												</td>
												<td className="py-3 px-4">
													{order.productName}
												</td>
												<td className="py-3 px-4">
													{order.quantity}
												</td>
												<td className="py-3 px-4">
													${order.totalPrice}
												</td>
												<td className="py-3 px-4">
													{order.date}
												</td>
												<td className="py-3 px-4">
													<span
														className={`px-2 py-1 rounded-full text-xs 
                              ${
									order.status === "pending"
										? "bg-blue-100 text-blue-800"
										: order.status === "out for delivery"
										? "bg-yellow-100 text-yellow-800"
										: order.status === "delivered"
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
													>
														{order.status}
													</span>
												</td>
												<td className="py-3 px-4">
													{order.status ===
													"pending" ? (
														<button
															onClick={() =>
																handleCancelOrder(
																	order.id
																)
															}
															className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
														>
															Cancel Order
														</button>
													) : (
														<span className="text-sm text-gray-500">
															{order.status ===
															"cancelled"
																? "cancelled"
																: "Cannot cancel"}
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-600">
								You haven't placed any orders yet.
							</p>
						)}
					</section>
				)}
			</main>

			{/* Contact number modal*/}
			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-xl font-semibold mb-4">
							Enter Contact Number
						</h2>
						<input
							type="tel"
							placeholder="Enter your contact number"
							value={contactNumber}
							onChange={(e) => setContactNumber(e.target.value)}
							className="w-full border p-2 rounded mb-4"
						/>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => {
									setIsOpen(false);
									setContactNumber("");
								}}
								className="bg-gray-400 text-white px-4 py-2 rounded"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									confirmOrder();
								}}
								className="bg-blue-500 text-white px-4 py-2 rounded"
							>
								Order
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-10 mt-12">
				<div className="container mx-auto px-4">
					<div className="mt-8 pt-8 border-t border-gray-800 text-center">
						<p>
							&copy; 2025 PC Parts Express. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default MainPage;
