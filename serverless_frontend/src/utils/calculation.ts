import { Product } from "../components/MainPage";

// Calculate price for a product based on quantity
export const calculatePrice = (product: Product, quantity: number): number => {
	return product.price * quantity;
};

// Calculate final price including any discounts
export const calculateFinalPrice = (
	product: Product,
	quantity: number
): number => {
	const basePrice = calculatePrice(product, quantity);

	return basePrice;
};
