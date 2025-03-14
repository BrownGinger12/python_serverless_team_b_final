import { Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
	setNewStatus: (val: string) => void;
}

const OrderStatusDropdown = ({ setNewStatus }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState("All");
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleSelect = (status: any) => {
		setSelectedStatus(status);
		setIsOpen(false);
		setNewStatus(status);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			className="relative inline-block text-sm text-left"
			ref={dropdownRef}
		>
			<button
				onClick={toggleDropdown}
				className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none w-[250px] justify-between"
			>
				<div className="flex items-center gap-1">
					<Filter size={16} className="text-gray-500" />
					<span className="ml-1 font-medium capitalize">
						Status: {selectedStatus}
					</span>
				</div>
				{/* Dropdown Arrow */}
				<svg
					className="w-4 h-4 ml-2 text-gray-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute right-0 w-40 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
					<ul className="py-1 text-gray-700">
						{[
							"All",
							"Pending",
							"Cancelled",
							"Out For Delivery",
							"Delivered",
						].map((status) => (
							<li
								key={status}
								className="px-4 py-2 cursor-pointer hover:bg-gray-100"
								onClick={() =>
									handleSelect(status.toLowerCase())
								}
							>
								{status}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default OrderStatusDropdown;
