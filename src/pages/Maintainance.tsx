import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { useNavigate } from "react-router";

interface Maintainance {
  id: string;
  customerId: string;
  customerName: string;
  assignedToId: string;
  assignedToName: string;
  type: string;
  priority: string;
  status: string;
  note: string;
  scheduledDate: Date | null;
}

// Add interface for customers
interface Customer {
  id: string;
  name: string;
  username?: string;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

const Maintainance = () => {
  const [maintainances, setMaintainances] = useState<Maintainance[]>([]);
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaintainance, setSelectedMaintainance] =
    useState<Maintainance | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add state for customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Add state for technicians
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const [newMaintainance, setNewMaintainance] = useState<Maintainance>({
    id: "",
    customerId: "",
    customerName: "",
    assignedToId: "",
    assignedToName: "",
    type: "",
    priority: "",
    status: "",
    note: "",
    scheduledDate: new Date(),
  });
  const navigate = useNavigate();

  // Add function to fetch customers
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await api.get("/customers"); // or "/users" depending on your API
      setCustomers(res.data.data || res.data); // Handle different response structures
    } catch (error) {
      console.error("Error fetching customers:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.status === 401
      ) {
        navigate("/login");
      } else {
        alert("Failed to fetch customers");
      }
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchTechnicians = async () => {
    setLoadingTechnicians(true);
    try {
      const res = await api.get("/users");
      setTechnicians(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.status === 401
      ) {
        navigate("/login");
      } else {
        alert("Failed to fetch technicians");
      }
    } finally {
      setLoadingTechnicians(false);
    }
  };

  useEffect(() => {
    if (showCreateModal || showModal) {
      fetchCustomers();
      fetchTechnicians();
    }
  }, [showCreateModal, showModal]);

  const fetchMaintainance = async (page = 1) => {
    try {
      const res = await api.get("/maintainances", {
        params: { page, limit: 10 },
      });
      setMaintainances(
        res.data.data.map((inst: any) => ({
          ...inst,
          customerName: inst.customer?.name ?? "",
          assignedToName:
            inst.assignedTo?.firstName ??
            "" + " " + (inst.assignedTo?.lastName ?? ""),
        }))
      );
      setTotalPages(res.data.meta.lastPage);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.status === 401
      ) {
        navigate("/login");
      } else {
        alert("Failed to fetch maintainance");
      }
    }
  };

  useEffect(() => {
    fetchMaintainance(currentPage);
  }, [currentPage]);

  const handleDelete = async (maintainance: Maintainance) => {
    if (!confirm(`Are you sure you want to delete this maintainance?`)) {
      return;
    }

    try {
      await api.delete(`/maintainances/${maintainance.id}`);
      fetchMaintainance(currentPage);
    } catch (error) {
      console.error("Error deleting maintainance:", error);
      alert("Failed to delete maintainance");
    }
  };

  const openModal = (maintainance: Maintainance) => {
    setSelectedMaintainance(maintainance);
    setShowModal(true);
  };

  const handleCreateMaintainance = async () => {
    try {
      await api.post("/maintainances", {
        customerId: newMaintainance.customerId,
        assignedToId: newMaintainance.assignedToId,
        type: newMaintainance.type,
        priority: newMaintainance.priority,
        status: newMaintainance.status,
        note: newMaintainance.note,
        scheduledDate: newMaintainance.scheduledDate
          ? newMaintainance.scheduledDate.toISOString()
          : null,
      });
      setShowCreateModal(false);
      // Reset form
      setNewMaintainance({
        id: "",
        customerId: "",
        customerName: "",
        assignedToId: "",
        assignedToName: "",
        priority: "",
        type: "",
        status: "",
        note: "",
        scheduledDate: new Date(),
      });
      fetchMaintainance(currentPage);
      alert("Maintenance created successfully");
    } catch (error) {
      console.error("Error creating maintenance:", error);
      alert("Failed to create maintenance");
    }
  };

  const handleUpdateMaintenance = async () => {
    if (!selectedMaintainance) return;
    try {
      await api.patch(`/maintainances/${selectedMaintainance.id}`, {
        customerId: selectedMaintainance.customerId,
        assignedToId: selectedMaintainance.assignedToId,
        type: selectedMaintainance.type,
        priority: selectedMaintainance.priority,
        status: selectedMaintainance.status,
        note: selectedMaintainance.note,
        scheduledDate: selectedMaintainance.scheduledDate
          ? new Date(selectedMaintainance.scheduledDate).toISOString()
          : null,
      });
      setShowModal(false);
      fetchMaintainance(currentPage);
      alert("Maintenance updated successfully");
    } catch (error) {
      console.error("Error updating maintenance:", error);
      alert("Failed to update maintenance");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <div className="flex gap-2">
          
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setShowCreateModal(true)}
          >
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maintainances.map((maintenance) => (
          <div
            key={maintenance.id}
            className="bg-white p-4 shadow rounded border hover:border-yellow-400"
          >
            <h2 className="font-semibold text-lg">
              {maintenance.customerName}
            </h2>

            <p className="text-sm text-gray-600">
              Technician: {maintenance.assignedToName}
            </p>
            <p className="text-sm text-gray-600">Type: {maintenance.type}</p>
            <p className="text-sm text-gray-600">
              Priority: {maintenance.priority} kW
            </p>
            <p className="text-sm text-gray-600">
              Status: {maintenance.status}
            </p>
            <p className="text-sm text-gray-600">Note: {maintenance.note}%</p>
            <p className="text-sm text-gray-600">
              Scheduled:{" "}
              {maintenance.scheduledDate
                ? new Date(maintenance.scheduledDate).toLocaleDateString()
                : ""}{" "}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openModal(maintenance)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "Delete button clicked for maintenance:",
                    maintenance.id
                  );
                  handleDelete(maintenance);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <h2 className="text-lg font-bold mb-4">Create Installation</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Customer</label>
            {loadingCustomers ? (
              <div className="border p-2 rounded w-full bg-gray-100">
                Loading customers...
              </div>
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={newMaintainance.customerId}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (customer) => customer.id === e.target.value
                  );
                  setNewMaintainance({
                    ...newMaintainance,
                    customerId: e.target.value,
                    customerName:
                      selectedCustomer?.name ||
                      selectedCustomer?.username ||
                      "",
                  });
                }}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Technician</label>
            {loadingTechnicians ? (
              <div className="border p-2 rounded w-full bg-gray-100">
                Loading technicians...
              </div>
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={newMaintainance.assignedToId}
                onChange={(e) => {
                  const selectedTechnician = technicians.find(
                    (technician) => technician.id === e.target.value
                  );
                  setNewMaintainance({
                    ...newMaintainance,
                    assignedToId: e.target.value,
                    assignedToName:
                      selectedTechnician?.firstName +
                        " " +
                        selectedTechnician?.lastName || "",
                  });
                }}
                required
              >
                <option value="">Select a technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.firstName + " " + technician.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Type</label>
            <input
              type="text"
              placeholder="Type"
              className="border p-2 rounded w-full"
              value={newMaintainance.type || ""}
              onChange={(e) =>
                setNewMaintainance({
                  ...newMaintainance,
                  type: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="border p-2 rounded w-full"
              value={newMaintainance.priority}
              onChange={(e) =>
                setNewMaintainance({
                  ...newMaintainance,
                  priority: e.target.value,
                })
              }
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="border p-2 rounded w-full"
              value={newMaintainance.status}
              onChange={(e) =>
                setNewMaintainance({
                  ...newMaintainance,
                  status: e.target.value,
                })
              }
            >
              <option value="">Select status</option>
              <option value="planned">Pending </option>
              <option value="in-progress">Scheduled </option>
              <option value="completed">In Progress</option>
              <option value="maintenance">Completed</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Note</label>
            <input
              type="text"
              placeholder="Note"
              className="border p-2 rounded w-full"
              value={newMaintainance.note || ""}
              onChange={(e) =>
                setNewMaintainance({
                  ...newMaintainance,
                  note: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Schedule Date
            </label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              onChange={(e) =>
                setNewMaintainance({
                  ...newMaintainance,
                  scheduledDate: e.target.value
                    ? new Date(e.target.value)
                    : null,
                })
              }
            />
          </div>

          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
            onClick={handleCreateMaintainance}
          >
            Create Maintenance
          </button>
        </Modal>
      )}

      {showModal && selectedMaintainance && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-bold mb-4">Edit Maintenance</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Customer</label>
            {loadingCustomers ? (
              <div className="border p-2 rounded w-full bg-gray-100">
                Loading customers...
              </div>
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={selectedMaintainance.customerId}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (customer) => customer.id === e.target.value
                  );
                  setSelectedMaintainance({
                    ...selectedMaintainance,
                    customerId: e.target.value,
                    customerName:
                      selectedCustomer?.name ||
                      selectedCustomer?.username ||
                      "",
                  });
                }}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Technician</label>
            {loadingTechnicians ? (
              <div className="border p-2 rounded w-full bg-gray-100">
                Loading technicians...
              </div>
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={selectedMaintainance.assignedToId}
                onChange={(e) => {
                  const selectedTechnician = technicians.find(
                    (technician) => technician.id === e.target.value
                  );
                  setSelectedMaintainance({
                    ...selectedMaintainance,
                    assignedToId: e.target.value,
                    assignedToName:
                      selectedTechnician?.firstName +
                        " " +
                        selectedTechnician?.lastName || "",
                  });
                }}
              >
                <option value="">Select a technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.firstName + " " + technician.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Type</label>
            <input
              type="text"
              placeholder="Panels"
              className="border p-2 rounded w-full"
              value={selectedMaintainance.type}
              onChange={(e) =>
                setSelectedMaintainance({
                  ...selectedMaintainance,
                  type: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedMaintainance.priority}
              onChange={(e) =>
                setSelectedMaintainance({
                  ...selectedMaintainance,
                  status: e.target.value,
                })
              }
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedMaintainance.status}
              onChange={(e) =>
                setSelectedMaintainance({
                  ...selectedMaintainance,
                  status: e.target.value,
                })
              }
            >
              <option value="">Select status</option>
              <option value="planned">Pending </option>
              <option value="in-progress">Scheduled </option>
              <option value="completed">In Progress</option>
              <option value="maintenance">Completed</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Note</label>
            <input
              type="text"
              placeholder="Note"
              className="border p-2 rounded w-full"
              value={selectedMaintainance.note}
              onChange={(e) =>
                setSelectedMaintainance({
                  ...selectedMaintainance,
                  note: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Next Maintenance Date
            </label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={
                selectedMaintainance.scheduledDate
                  ? new Date(selectedMaintainance.scheduledDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setSelectedMaintainance({
                  ...selectedMaintainance,
                  scheduledDate: e.target.value
                    ? new Date(e.target.value)
                    : null,
                })
              }
            />
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={handleUpdateMaintenance}
          >
            Update Maintenance
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Maintainance;
