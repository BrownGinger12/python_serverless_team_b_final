import { useState, useEffect } from "react";
import AddTicketForm from "./AddTicketForm";

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
}

const TicketsPanel = () => {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	// sort states
	const [sortField, setSortField] = useState<keyof Ticket>("created_at");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	// modal staet
	const [showModal, setShowModal] = useState(false);

	const handleCloseModal = () => {
		setShowModal(false);
	};

	// Mock data for demo purposes - replace with API call
	useEffect(() => {
		const mockTickets: Ticket[] = [
			{
				id: 1,
				priority: 2,
				source: 7,
				requester_id: 51065162071,
				responder_id: 51065162071,
				status: 5,
				subject: "Conversation with Angel Jude Diones",
				type: "Question",
				created_at: "2025-03-13T05:14:14Z",
				updated_at: "2025-03-15T06:02:46Z",
			},
			{
				id: 2,
				priority: 1,
				source: 7,
				requester_id: 51065162071,
				responder_id: 51065162071,
				status: 5,
				subject: "Conversation with Angel Jude Diones",
				type: "Question",
				created_at: "2025-03-13T05:14:14Z",
				updated_at: "2025-03-15T06:02:46Z",
			},
		];
		setTickets(mockTickets);
		setFilteredTickets(mockTickets);
	}, []);

	// Status options
	const statuses = [
		{ id: 1, name: "Open" },
		{ id: 2, name: "Pending" },
		{ id: 3, name: "Resolved" },
		{ id: 4, name: "Closed" },
		{ id: 5, name: "New" },
	];

	// Apply search and filters
	useEffect(() => {
		let result = [...tickets];

		if (searchTerm) {
			result = result.filter(
				(ticket) =>
					ticket.subject
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					ticket.id.toString().includes(searchTerm)
			);
		}

		if (statusFilter) {
			result = result.filter(
				(ticket) => ticket.status.toString() === statusFilter
			);
		}

		// Sort the results
		result.sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortDirection === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			// For number values
			if (aValue === bValue) return 0;

			const comparison = aValue < bValue ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});

		setFilteredTickets(result);
	}, [tickets, searchTerm, statusFilter, sortField, sortDirection]);

	const openAddTicketModal = () => {
		setShowModal(true);
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setStatusFilter("");
	};

	const handleSort = (field: keyof Ticket) => {
		if (field === sortField) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Helper function to render sort icon
	const renderSortIcon = (field: keyof Ticket) => {
		if (sortField !== field) return null;

		return sortDirection === "asc" ? (
			<span className="ml-1">↑</span>
		) : (
			<span className="ml-1">↓</span>
		);
	};

	// Format date to a more readable format
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	// Helper function to determine priority text and class
	const getPriorityInfo = (priority: number) => {
		switch (priority) {
			case 1:
				return { text: "Low", class: "bg-green-100 text-green-800" };
			case 2:
				return {
					text: "Medium",
					class: "bg-yellow-100 text-yellow-800",
				};
			case 3:
				return { text: "High", class: "bg-orange-100 text-orange-800" };
			case 4:
				return { text: "Urgent", class: "bg-red-100 text-red-800" };
			default:
				return { text: "Unknown", class: "bg-gray-100 text-gray-800" };
		}
	};

	const handleSubmitTicket = (ticketData: Ticket) => {
		// Generate a new ID for the ticket
		const newId = Math.max(0, ...tickets.map((t) => t.id)) + 1;

		const newTicket = {
			...ticketData,
			id: newId,
		};

		// Add the new ticket to the tickets array
		setTickets((prevTickets) => [...prevTickets, newTicket]);

		// Close the modal
		setShowModal(false);
	};

	return (
		<div className="min-h-screen w-full bg-gray-100 p-6">
			<div className="max-w-6xl mx-auto">
				<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
					<h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
						Ticket Management System
					</h1>
					<div className="flex flex-col sm:flex-row gap-2">
						<button
							onClick={openAddTicketModal}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							Add Ticket
						</button>
					</div>
				</header>

				{/* Search and Filter */}
				<div className="bg-white p-4 rounded-lg shadow mb-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Search Tickets
							</label>
							<div className="relative">
								<input
									type="text"
									id="search"
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									placeholder="Search by subject or ticket ID..."
									className="p-2 pl-10 w-full border border-gray-300 rounded-md"
								/>
								<svg
									className="w-5 h-5 text-gray-400 absolute left-3 top-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
						</div>
						<div className="flex-1">
							<label
								htmlFor="statusFilter"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Filter by Status
							</label>
							<select
								id="statusFilter"
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value)
								}
								className="p-2 w-full border border-gray-300 rounded-md"
							>
								<option value="">All Statuses</option>
								{statuses.map((status) => (
									<option
										key={status.id}
										value={status.id.toString()}
									>
										{status.name}
									</option>
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

				{/* Tickets List */}
				<div className="bg-white rounded-lg shadow overflow-hidden h-[70vh]">
					<div className="p-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-800">
							Tickets
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							Showing {filteredTickets.length} of {tickets.length}{" "}
							tickets
						</p>
					</div>
					<div className="overflow-x-auto h-[83%] overflow-y-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										onClick={() => handleSort("id")}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										ID {renderSortIcon("id")}
									</th>
									<th
										scope="col"
										onClick={() => handleSort("priority")}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Priority {renderSortIcon("priority")}
									</th>
									<th
										scope="col"
										onClick={() => handleSort("source")}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Source {renderSortIcon("source")}
									</th>
									<th
										scope="col"
										onClick={() =>
											handleSort("requester_id")
										}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Requester ID{" "}
										{renderSortIcon("requester_id")}
									</th>
									<th
										scope="col"
										onClick={() =>
											handleSort("responder_id")
										}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Responder ID{" "}
										{renderSortIcon("responder_id")}
									</th>
									<th
										scope="col"
										onClick={() => handleSort("created_at")}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Created At{" "}
										{renderSortIcon("created_at")}
									</th>
									<th
										scope="col"
										onClick={() => handleSort("updated_at")}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
									>
										Updated At{" "}
										{renderSortIcon("updated_at")}
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredTickets.map((ticket) => {
									const priorityInfo = getPriorityInfo(
										ticket.priority
									);

									return (
										<tr
											key={ticket.id}
											className="hover:bg-gray-50"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{ticket.id}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityInfo.class}`}
												>
													{priorityInfo.text}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{ticket.source}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{ticket.requester_id}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{ticket.responder_id}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(ticket.created_at)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(ticket.updated_at)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<button
													onClick={() =>
														console.log(
															"View ticket",
															ticket.id
														)
													}
													className="text-indigo-600 hover:text-indigo-900 mr-4"
												>
													View
												</button>
												<button
													onClick={() =>
														console.log(
															"Edit ticket",
															ticket.id
														)
													}
													className="text-green-600 hover:text-green-900 mr-4"
												>
													Edit
												</button>
											</td>
										</tr>
									);
								})}
								{filteredTickets.length === 0 && (
									<tr>
										<td
											colSpan={8}
											className="px-6 py-4 text-center text-sm text-gray-500"
										>
											No tickets found.{" "}
											{tickets.length > 0
												? "Try adjusting your filters."
												: "Add a new ticket to get started."}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Add Ticket Modal */}
			{showModal && (
				<AddTicketForm
					onClose={handleCloseModal}
					onSubmit={handleSubmitTicket}
				/>
			)}
		</div>
	);
};

export default TicketsPanel;
