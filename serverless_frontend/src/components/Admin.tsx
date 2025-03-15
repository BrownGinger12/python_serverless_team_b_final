import React, { useEffect, useState } from "react";
import { Package, ShoppingCart } from "lucide-react";
import PCPartsAdmin from "./PCPartsAdmin";
import OrdersDashboard from "./OrdersDashboard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Admin: React.FC = () => {
	const { userId, isLoading } = useAuth();
	const navigate = useNavigate();
	const [activeItem, setActiveItem] = useState("products");

	useEffect(() => {
		if (!userId && !isLoading) {
			alert(
				"Cannot access admin without permission. Redirecting to login page."
			);
			navigate("/login");
			return;
		}
	}, [userId, isLoading]);

	const handleItemClick = (item: string) => {
		setActiveItem(item);
	};

	return (
		<div className="w-full h-[100vh] flex flex-row justify-end relative">
			<div className="w-[20%] h-full bg-white shadow-lg left-0 fixed top-0">
				{/* Logo section */}
				<div className="px-4 py-6 flex items-center">
					<div className="bg-blue-600 text-white p-2 rounded-md">
						<Package size={24} />
					</div>
					<span className="ml-2 text-xl font-semibold">
						AdminPanel
					</span>
				</div>

				{/* Navigation */}
				<div className="px-2 py-4 space-y-1">
					{/* Products */}
					<div
						className={`flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors ${
							activeItem === "products"
								? "bg-blue-100 text-blue-700"
								: "hover:bg-gray-100"
						}`}
						onClick={() => handleItemClick("products")}
					>
						<Package size={18} className="mr-3" />
						<span>Products</span>
					</div>

					{/* Orders */}
					<div
						className={`flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors ${
							activeItem === "orders"
								? "bg-blue-100 text-blue-700"
								: "hover:bg-gray-100"
						}`}
						onClick={() => handleItemClick("orders")}
					>
						<ShoppingCart size={18} className="mr-3" />
						<span>Orders</span>
					</div>
				</div>
			</div>

			<div className="w-[80%] h-full">
				{activeItem === "products" && <PCPartsAdmin />}
				{activeItem === "orders" && <OrdersDashboard />}
			</div>
		</div>
	);
};

export default Admin;
