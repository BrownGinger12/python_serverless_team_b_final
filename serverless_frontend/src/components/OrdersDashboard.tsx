import { useEffect, useState } from "react";
import {
	Check,
	Truck,
	Clock,
	Search,
	Trash2,
	AlertTriangle,
	X,
} from "lucide-react";
import axiosClient from "../client/AxiosClient";
import axios from "axios";
import OrderStatusDropdown from "./OrderStatusDropdown";

// Define TypeScript interfaces
interface Order {
	order_id: string;
	product_id: string;
	datetime: string;
	number: string;
	quantity: number;
	order_status: "pending" | "out for delivery" | "delivered" | "cancelled";
	total_price: number;
}

type StatusOption = "pending" | "out for delivery" | "delivered" | "cancelled";

const OrdersDashboard = () => {
	// Sample orders data
	const [orders, setOrders] = useState<Order[]>([]);

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
	const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const updateOrder = async (
		order_id: string,
		new_status: string,
		contact_number: string
	) => {
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

		const message = `Your order status has been set to "${new_status}". Order ID: ${order_id}. Thank you!`;

		if (response.data.body.statusCode === 200) {
			sendSMS(contact_number, message);
		}

		console.log(response);
	};

	const sendSMS = async (contact_number: string, message: string) => {
		const api_key = import.meta.env.VITE_SMS_API_KEY;
		try {
			const response = await axios.post(
				"https://app.philsms.com/api/v3/sms/send",
				{
					recipient: contact_number,
					sender_id: "PhilSMS",
					type: "plain",
					message: message,
				},
				{
					headers: {
						Authorization: `Bearer ${api_key}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);

			console.log("SMS Sent Successfully:", response.data);
		} catch (error) {
			console.error("Error Sending SMS:", error);
		}
	};

	// Handle status change
	const handleStatusChange = (
		orderId: string,
		newStatus: StatusOption,
		contact_number: string
	) => {
		setOrders(
			orders.map((order) =>
				order.order_id === orderId
					? { ...order, order_status: newStatus }
					: order
			)
		);

		updateOrder(orderId, newStatus, contact_number);
	};

	// Handle delete order
	const handleDeleteOrder = (orderId: string) => {
		setOrderToDelete(orderId);
		setShowDeleteModal(true);
	};

	const deleteProduct = async (order_id: string) => {
		const response = await axiosClient.delete(`/order/${order_id}`);

		if (response.data.body.statusCode === 200) {
			alert("Order deleted");
		}

		console.log(response);
	};

	// Confirm delete order
	const confirmDeleteOrder = () => {
		if (orderToDelete) {
			setOrders(
				orders.filter((order) => order.order_id !== orderToDelete)
			);
			deleteProduct(orderToDelete);
			setShowDeleteModal(false);
			setOrderToDelete(null);
		}
	};

	// Cancel delete
	const cancelDelete = () => {
		setShowDeleteModal(false);
		setOrderToDelete(null);
	};

	// Status badge component
	const StatusBadge = ({ status }: { status: string }) => {
		let bgColor = "";
		let textColor = "";
		let icon = null;

		switch (status) {
			case "pending":
				bgColor = "bg-yellow-100";
				textColor = "text-yellow-800";
				icon = <Clock size={14} className="mr-1" />;
				break;
			case "out for delivery":
				bgColor = "bg-blue-100";
				textColor = "text-blue-800";
				icon = <Truck size={14} className="mr-1" />;
				break;
			case "delivered":
				bgColor = "bg-green-100";
				textColor = "text-green-800";
				icon = <Check size={14} className="mr-1" />;
				break;
			case "cancelled":
				bgColor = "bg-red-100";
				textColor = "text-red-800";
				icon = <X size={14} className="mr-1" />;
				break;
			default:
				bgColor = "bg-gray-100";
				textColor = "text-gray-800";
		}

		return (
			<span
				className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
			>
				{icon}
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	// Status select component with delete button
	const StatusSelect = ({ order }: { order: Order }) => {
		return (
			<div className="flex items-center space-x-2">
				<select
					value={order.order_status}
					onChange={(e) =>
						handleStatusChange(
							order.order_id,
							e.target.value as StatusOption,
							order.number
						)
					}
					className="block w-40 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				>
					<option value="pending">Pending</option>
					<option value="out for delivery">Out for Delivery</option>
					<option value="delivered">Delivered</option>
					<option value="cancelled">Cancel</option>
				</select>

				<button
					onClick={() => handleDeleteOrder(order.order_id)}
					className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
					title="Delete Order"
				>
					<Trash2 size={16} />
				</button>
			</div>
		);
	};

	// Delete Confirmation Modal
	const DeleteModal = () => {
		if (!showDeleteModal) return null;

		const orderDetails = orders.find(
			(order) => order.order_id === orderToDelete
		);

		return (
			<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
					<div className="flex items-center mb-4">
						<div className="bg-red-100 p-2 rounded-full mr-3">
							<AlertTriangle className="text-red-600" size={24} />
						</div>
						<h3 className="text-lg font-medium text-gray-900">
							Confirm Delete
						</h3>
					</div>

					<p className="text-gray-600 mb-4">
						Are you sure you want to delete order{" "}
						<span className="font-medium">{orderToDelete}</span>?
						{orderDetails && (
							<span className="block mt-2 text-sm">
								Product: {orderDetails.product_id} • Customer:{" "}
								{orderDetails.number} • Amount: $
								{orderDetails.total_price}
							</span>
						)}
					</p>

					<div className="flex justify-end space-x-3">
						<button
							className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
							onClick={cancelDelete}
						>
							Cancel
						</button>
						<button
							className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
							onClick={confirmDeleteOrder}
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		);
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

	const handleSort = () => {
		setSortDirection(sortDirection === "asc" ? "desc" : "asc");
	};

	useEffect(() => {
		const fetchOrders = async () => {
			const order_data = await getAllOrders(); // Await the async function

			console.log("Orders:", order_data);

			const mappedOrders = order_data.map((item: any) => ({
				order_id: item.order_id,
				product_id: item.product_id,
				datetime: item.datetime,
				number: item.contact_number,
				quantity: item.quantity,
				total_price: item.total_price,
				order_status: item.order_status,
			}));

			setOrders(mappedOrders);
		};

		fetchOrders();
	}, []);

	useEffect(() => {
		let results = orders;

		if (searchQuery) {
			results = results.filter((order) =>
				order.order_id.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (statusFilter !== "all") {
			results = results.filter(
				(order) => order.order_status === statusFilter
			);
		}

		results = [...results].sort((a, b) => {
			const dateA = new Date(a.datetime).getTime();
			const dateB = new Date(b.datetime).getTime();
			return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
		});

		setFilteredOrders(results);

		setFilteredOrders(results);
	}, [orders, searchQuery, statusFilter, sortDirection]);

	return (
		<div className="flex flex-col w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-gray-800">
					Orders Dashboard
				</h1>
				<div className="flex items-center space-x-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Search orders..."
							className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<Search
							className="absolute left-3 top-2.5 text-gray-400"
							size={18}
						/>
					</div>

					<div className="relative">
						<OrderStatusDropdown setNewStatus={setStatusFilter} />
					</div>
				</div>
			</div>

			{/* Dashboard Summary */}
			<div className="mt-8 grid grid-cols-3 gap-6 mb-6">
				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
							<Clock size={20} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600">
								Pending
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{
									orders.filter(
										(order) =>
											order.order_status === "pending"
									).length
								}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
							<Truck size={20} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600">
								Out for Delivery
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{
									orders.filter(
										(order) =>
											order.order_status ===
											"out for delivery"
									).length
								}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
							<Check size={20} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600">
								Delivered
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{
									orders.filter(
										(order) =>
											order.order_status === "delivered"
									).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Orders Table */}
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Order ID
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Product
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
								onClick={handleSort}
							>
								<div className="flex items-center">
									Date & Time
									<span className="ml-2 font-bold text-primary">
										{sortDirection === "asc" ? "↑" : "↓"}
									</span>
								</div>
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Contact
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Quantity
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Total
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredOrders.length > 0 ? (
							filteredOrders.map((order: Order) => (
								<tr
									key={order.order_id}
									className="hover:bg-gray-50"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{order.order_id}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{order.product_id}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatDate(order.datetime)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{order.number}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{order.quantity}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											${order.total_price}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<StatusBadge
											status={order.order_status}
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<StatusSelect order={order} />
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={8}
									className="px-6 py-4 text-center text-sm text-gray-500"
								>
									No orders found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteModal />
		</div>
	);
};

export default OrdersDashboard;
