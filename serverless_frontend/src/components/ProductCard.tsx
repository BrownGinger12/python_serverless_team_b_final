import { calculateFinalPrice, calculatePrice } from "../utils/calculation";
import { Product } from "./MainPage";

interface Props {
	product: Product;
	quantities: { [key: string]: number };
	handleQuantityChange: (id: string, quantity: number) => void;
	handleOrder: (product: Product) => void;
}

const ProductCard = ({
	product,
	quantities,
	handleQuantityChange,
	handleOrder,
}: Props) => {
	return (
		<div
			key={product.id}
			className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
		>
			<div className="h-48 flex items-center justify-center p-4">
				<img
					src={product.imagePath}
					alt={product.name}
					className="max-h-40 max-w-full object-contain"
				/>
			</div>

			<div className="p-4 flex-grow">
				<h3 className="font-semibold text-gray-800 text-lg mb-2 h-12 overflow-hidden">
					{product.name}
				</h3>
				<p className="text-gray-600 text-sm">{product.brandName}</p>
				<p className="text-red-700 font-bold text-xl my-2">
					${product.price}
				</p>
				<p
					className={`text-sm ${
						product.stock > 0 ? "text-green-600" : "text-red-600"
					}`}
				>
					{product.stock > 0
						? `In Stock: ${product.stock}`
						: "Out of Stock"}
				</p>

				{/* Quantity selector */}
				<div className="flex items-center mt-2">
					<span className="text-sm text-gray-700 mr-2">Qty:</span>
					<div className="flex border rounded">
						<button
							className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
							onClick={() =>
								handleQuantityChange(
									product.id,
									(quantities[product.id] || 1) - 1
								)
							}
							disabled={product.stock <= 0}
						>
							-
						</button>
						<input
							type="number"
							min="1"
							max={product.stock}
							value={quantities[product.id] || 1}
							onChange={(e) =>
								handleQuantityChange(
									product.id,
									parseInt(e.target.value) || 1
								)
							}
							className="w-12 text-center"
							disabled={product.stock <= 0}
						/>
						<button
							className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
							onClick={() =>
								handleQuantityChange(
									product.id,
									(quantities[product.id] || 1) + 1
								)
							}
							disabled={
								product.stock <= 0 ||
								(quantities[product.id] || 1) >= product.stock
							}
						>
							+
						</button>
					</div>
				</div>

				{/* Price calculation */}
				{product.stock > 0 && quantities[product.id] > 1 && (
					<div className="mt-2">
						<p className="text-sm text-gray-700">
							Subtotal: $
							{calculatePrice(
								product,
								quantities[product.id] || 1
							)}
						</p>
						<p className="text-sm font-semibold">
							Final Price: $
							{calculateFinalPrice(
								product,
								quantities[product.id] || 1
							)}
						</p>
					</div>
				)}
			</div>

			<div className="p-4 pt-0">
				<button
					onClick={() => handleOrder(product)}
					disabled={product.stock <= 0}
					className={`w-full py-2 rounded-full font-bold text-center 
${
	product.stock > 0
		? "bg-yellow-400 hover:bg-yellow-500"
		: "bg-gray-300 cursor-not-allowed"
}
`}
				>
					{product.stock > 0 ? "Order Now" : "Out of Stock"}
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
