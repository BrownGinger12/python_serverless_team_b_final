import { useState, ChangeEvent, FormEvent } from "react";

interface Ticket {
	id: number;
	priority: number;
	source: number;
	requester_id: number;
	responder_id: number;
	created_at: string;
	updated_at: string;
	status: number;
	subject: string;
	type: string;
	description?: string;
}

interface AddTicketFormProps {
	onClose: () => void;
	onSubmit: (ticket: Ticket) => void;
}

const AddTicketForm = ({ onClose, onSubmit }: AddTicketFormProps) => {
	const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
		priority: 1,
		source: 7,
		status: 5, // Automatically set to "New" status
		type: "Question",
		subject: "",
		description: "",
	});

	const handleInputChange = (
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setNewTicket({
			...newTicket,
			[name]:
				name === "priority" || name === "source"
					? parseInt(value, 10)
					: value,
		});
	};

	const handleSubmitTicket = (e: FormEvent) => {
		e.preventDefault();

		// Create a new ticket with required fields
		const currentDate = new Date().toISOString();

		const createdTicket: Ticket = {
			...(newTicket as any),
			status: 5, // Always set status to "New" (5)
			requester_id: 51065162071, // Using mock ID for demo
			responder_id: 51065162071, // Using mock ID for demo
			created_at: currentDate,
			updated_at: currentDate,
		};

		onSubmit(createdTicket);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 m-4">
				<div className="flex justify-between items-center border-b pb-4">
					<h3 className="text-xl font-semibold text-gray-800">
						Add New Ticket
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmitTicket} className="mt-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label
								htmlFor="subject"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Subject <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="subject"
								name="subject"
								value={newTicket.subject}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
								placeholder="Enter ticket subject"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="type"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Type
							</label>
							<select
								id="type"
								name="type"
								value={newTicket.type}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="Question">Question</option>
								<option value="Incident">Incident</option>
								<option value="Problem">Problem</option>
								<option value="Feature">Feature Request</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="priority"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Priority
							</label>
							<select
								id="priority"
								name="priority"
								value={newTicket.priority}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value={1}>Low</option>
								<option value={2}>Medium</option>
								<option value={3}>High</option>
								<option value={4}>Urgent</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Status
							</label>
							<div className="p-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
								Open
							</div>
						</div>
					</div>

					<div className="mb-4">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							rows={4}
							value={newTicket.description || ""}
							className="w-full p-2 border border-gray-300 rounded-md"
							onChange={handleInputChange}
							placeholder="Add your ticket description here..."
						></textarea>
					</div>

					<div className="flex justify-end space-x-3 border-t pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
						>
							Create Ticket
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddTicketForm;
