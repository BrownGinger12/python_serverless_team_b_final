import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../client/AxiosClient';

// Define types
type Product = {
    id: string;
    name: string;
    brandName: string,
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
};

type Category = {
    id: string;
    name: string;
};


const initialCategories: Category[] = [
    { id: '1', name: 'CPU' },
    { id: '2', name: 'GPU' },
    { id: '3', name: 'RAM' },
    { id: '4', name: 'Storage' },
    { id: '5', name: 'Motherboard' },
    { id: '6', name: 'Power Supply' },
    { id: '7', name: 'Case' },
    { id: '8', name: 'Cooling' },
    { id: '9', name: 'Peripherals' }
];

// Form values type
type ProductFormValues = Omit<Product, 'id'>;
type CategoryFormValues = {
    name: string;
};

// Main component
const PCPartsAdmin: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [productFormValues, setProductFormValues] = useState<ProductFormValues>({
        name: '',
        category: '',
        brandName: "",
        price: 0,
        stock: 0,
        imageUrl: '/api/placeholder/80/80'
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset product form when modal closes
    useEffect(() => {
        if (!isProductModalOpen) {
            setCurrentProduct(null);
            setProductFormValues({
                name: '',
                category: '',
                brandName: "",
                price: 0,
                stock: 0,
                imageUrl: '/api/placeholder/80/80'
            });
            setImagePreview(null);
        }
    }, [isProductModalOpen]);


    // Filter products based on search term and category
    useEffect(() => {
        let results = products;

        if (searchTerm) {
            results = results.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            results = results.filter(product =>
                product.category === categoryFilter
            );
        }

        if (categoryFilter === "")

        setFilteredProducts(results);
    }, [products, searchTerm, categoryFilter]);

    // Set image preview when editing a product
    useEffect(() => {
        if (currentProduct) {
            setImagePreview(currentProduct.imageUrl);
        }
    }, [currentProduct]);

    // Handle product form input changes
    const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductFormValues({
            ...productFormValues,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
        });
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image file size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const imageUrl = event.target.result as string;
                setImagePreview(imageUrl);
                setProductFormValues({
                    ...productFormValues,
                    imageUrl: imageUrl
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Open modal for adding a new product
    const handleAddProduct = () => {
        setCurrentProduct(null);
        setIsProductModalOpen(true);
    };


    // Open modal for editing an existing product
    const handleEditProduct = (product: Product) => {
        setCurrentProduct(product);
        setProductFormValues({
            name: product.name,
            category: product.category,
            brandName: product.brandName,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl
        });
        setIsProductModalOpen(true);
    };

    const deleteProduct = async (product_id: string) => {
        const response = await axiosClient.delete(`/product/${product_id}`)

        if (response.data.body.statusCode === 200) {
            alert("Product deleted")
        }

        console.log(response)
    }

    // Delete a product
    const handleDeleteProduct = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(product => product.id !== id));


            deleteProduct(id)

        }
    };

    const addNewProduct = async (product: Product) => {
        const prod_data = {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            brand_name: product.brandName,
            price: product.price,
            quantity: product.stock
        }

        const response = await axiosClient.post("/post_product", prod_data, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: false
        })

        if (response.data.body.statusCode === 200) {
            alert("Product Added")
        }

        console.log(response)
    }

    const updateProduct = async (product: Product) => {
        const prod_data = {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            brand_name: product.brandName,
            price: product.price,
            quantity: product.stock
        }

        const response = await axiosClient.put(`/product/${product.id}`, prod_data, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: false
        })

        if (response.data.body.statusCode === 200) {
            alert("Product updated")
        }

        console.log(response)
    }


    // Save product (add new or update existing)
    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();

        if (currentProduct) {
            // Update existing product
            setProducts(
                products.map(product =>
                    product.id === currentProduct.id
                        ? { ...product, ...productFormValues }
                        : product
                )
            );

            updateProduct(currentProduct)
        } else {
            // Add new product
            const newProduct: Product = {
                id: Date.now().toString(),
                ...productFormValues
            };
            setProducts([...products, newProduct]);
            addNewProduct(newProduct)
        }

        setIsProductModalOpen(false);
    };


    // Reset filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
    };

    const getAllProducts = async () => {
        try {
            const response = await axiosClient.get("/get_products")

            const prod_data = response.data.data

            return prod_data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }


    useEffect(() => {
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
                imageUrl: ""
            }));


            setProducts(mappedProducts);
        }

        fetchProducts()
    }, [])

    return (
        <div className="min-h-screen w-full bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">PC Express Admin</h1>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleAddProduct}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product
                        </button>
                    </div>
                </header>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by product name..."
                                    className="p-2 pl-10 w-full border border-gray-300 rounded-md"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                            <select
                                id="categoryFilter"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="p-2 w-full border border-gray-300 rounded-md"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleResetFilters}
                                className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-800">Products</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>
                    </div>
                    <div className="overflow-x-auto h-[450px] ">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Brand Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={product.imageUrl.startsWith('data:') ? product.imageUrl : '/api/placeholder/80/80'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.brandName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.stock} units
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No products found. {products.length > 0 ? 'Try adjusting your filters.' : 'Add a new product to get started.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900">
                                {currentProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct}>
                            <div className="p-6 space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-24 w-24 border rounded-md overflow-hidden bg-gray-100">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Product preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 flex items-center justify-center text-gray-400">
                                                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                            />
                                            <button
                                                type="button"
                                                onClick={triggerFileInput}
                                                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Upload Image
                                            </button>
                                            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={productFormValues.name}
                                        onChange={handleProductInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Brand Name</label>
                                    <input
                                        type="text"
                                        name="brandName"
                                        id="brandName"
                                        required
                                        value={productFormValues.brandName}
                                        onChange={handleProductInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        id="category"
                                        required
                                        value={productFormValues.category}
                                        onChange={handleProductInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        id="price"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={productFormValues.price}
                                        onChange={handleProductInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        id="stock"
                                        required
                                        min="0"
                                        value={productFormValues.stock}
                                        onChange={handleProductInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PCPartsAdmin;