import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { useNavigate } from "react-router";

interface Installations {
  id: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  panels: number;
  capacityKW: number;
  status: string;
  efficiency: number;
  nextMaintenance: Date | null;
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

const Installations = () => {
  const [installations, setInstallations] = useState<Installations[]>([]);
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInstallation, setSelectedInstallation] =
    useState<Installations | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add state for customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Add state for technicians
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const [newInstallation, setNewInstallation] = useState<Installations>({
    id: "",
    customerId: "",
    customerName: "",
    technicianId: "",
    technicianName: "",
    panels: 0,
    capacityKW: 0,
    status: "",
    efficiency: 0,
    nextMaintenance: new Date(),
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

  const fetchInstallations = async (page = 1, nameQuery = "") => {
    try {
      const res = await api.get("/installations", {
        params: { page, limit: 10, status: nameQuery },
      });
      setInstallations(
        res.data.data.map((inst: any) => ({
          ...inst,
          customerName: inst.customer?.name ?? "",
          technicianName:
            inst.technician?.firstName ??
            "" + " " + (inst.technician?.lastName ?? ""),
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
        alert("Failed to fetch installations");
      }
    }
  };

  useEffect(() => {
    fetchInstallations(currentPage, name);
  }, [currentPage, name, province]);

  const handleDelete = async (installation: Installations) => {
    if (!confirm(`Are you sure you want to delete this installation?`)) {
      return;
    }

    try {
      await api.delete(`/installations/${installation.id}`);
      fetchInstallations(currentPage, name);
    } catch (error) {
      console.error("Error deleting installation:", error);
      alert("Failed to delete installation");
    }
  };

  const openModal = (installation: Installations) => {
    setSelectedInstallation(installation);
    setShowModal(true);
  };

  const handleCreateInstallation = async () => {
    try {
      await api.post("/installations", {
        customerId: newInstallation.customerId,
        technicianId: newInstallation.technicianId,
        panels: newInstallation.panels,
        capacityKW: newInstallation.capacityKW,
        status: newInstallation.status,
        efficiency: newInstallation.efficiency,
        nextMaintenance: newInstallation.nextMaintenance
          ? newInstallation.nextMaintenance.toISOString()
          : null,
      });
      setShowCreateModal(false);
      // Reset form
      setNewInstallation({
        id: "",
        customerId: "",
        customerName: "",
        technicianId: "",
        technicianName: "",
        panels: 0,
        capacityKW: 0,
        status: "",
        efficiency: 0,
        nextMaintenance: new Date(),
      });
      fetchInstallations(currentPage, name);
      alert("Installation created successfully");
    } catch (error) {
      console.error("Error creating installation:", error);
      alert("Failed to create installation");
    }
  };

  const handleUpdateInstallation = async () => {
    if (!selectedInstallation) return;
    try {
      await api.patch(`/installations/${selectedInstallation.id}`, {
        customerId: selectedInstallation.customerId,
        technicianId: selectedInstallation.technicianId,
        panels: selectedInstallation.panels,
        capacityKW: selectedInstallation.capacityKW,
        status: selectedInstallation.status,
        efficiency: selectedInstallation.efficiency,
        nextMaintenance: selectedInstallation.nextMaintenance
          ? new Date(selectedInstallation.nextMaintenance).toISOString()
          : null,
      });
      setShowModal(false);
      fetchInstallations(currentPage, name);
      alert("Installation updated successfully");
    } catch (error) {
      console.error("Error updating installation:", error);
      alert("Failed to update installation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Installations</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setShowCreateModal(true)}
          >
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installations.map((installation) => (
          <div
            key={installation.id}
            className="bg-white p-4 shadow rounded border hover:border-yellow-400"
          >
            <h2 className="font-semibold text-lg">{installation.id}</h2>
            <p className="text-sm text-gray-600">
              Customer: {installation.customerName}
            </p>
            <p className="text-sm text-gray-600">
              Technician: {installation.technicianName}
            </p>
            <p className="text-sm text-gray-600">
              Panels: {installation.panels}
            </p>
            <p className="text-sm text-gray-600">
              Capacity: {installation.capacityKW} kW
            </p>
            <p className="text-sm text-gray-600">
              Status: {installation.status}
            </p>
            <p className="text-sm text-gray-600">
              Efficiency: {installation.efficiency}%
            </p>
            <p className="text-sm text-gray-600">
              Last Cleaned:{" "}
              {installation.nextMaintenance
                ? new Date(installation.nextMaintenance).toLocaleDateString()
                : ""}{" "}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openModal(installation)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "Delete button clicked for installation:",
                    installation.id
                  );
                  handleDelete(installation);
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
                value={newInstallation.customerId}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (customer) => customer.id === e.target.value
                  );
                  setNewInstallation({
                    ...newInstallation,
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
                value={newInstallation.technicianId}
                onChange={(e) => {
                  const selectedTechnician = technicians.find(
                    (technician) => technician.id === e.target.value
                  );
                  setNewInstallation({
                    ...newInstallation,
                    technicianId: e.target.value,
                    technicianName:
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
            <label className="block text-sm font-medium mb-1">Panels</label>
            <input
              type="number"
              placeholder="Number of panels"
              className="border p-2 rounded w-full"
              value={newInstallation.panels || ""}
              onChange={(e) =>
                setNewInstallation({
                  ...newInstallation,
                  panels: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Capacity (kW)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="capacityKW"
              className="border p-2 rounded w-full"
              value={newInstallation.capacityKW || ""}
              onChange={(e) =>
                setNewInstallation({
                  ...newInstallation,
                  capacityKW: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="border p-2 rounded w-full"
              value={newInstallation.status}
              onChange={(e) =>
                setNewInstallation({
                  ...newInstallation,
                  status: e.target.value,
                })
              }
            >
              <option value="">Select status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Efficiency (%)
            </label>
            <input
              type="number"
              placeholder="Efficiency"
              className="border p-2 rounded w-full"
              value={newInstallation.efficiency || ""}
              onChange={(e) =>
                setNewInstallation({
                  ...newInstallation,
                  efficiency: Number(e.target.value),
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
              onChange={(e) =>
                setNewInstallation({
                  ...newInstallation,
                  nextMaintenance: e.target.value
                    ? new Date(e.target.value)
                    : null,
                })
              }
            />
          </div>

          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
            onClick={handleCreateInstallation}
          >
            Create Installation
          </button>
        </Modal>
      )}

      {showModal && selectedInstallation && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-bold mb-4">Edit Installation</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Customer</label>
            {loadingCustomers ? (
              <div className="border p-2 rounded w-full bg-gray-100">
                Loading customers...
              </div>
            ) : (
              <select
                className="border p-2 rounded w-full"
                value={selectedInstallation.customerId}
                onChange={(e) => {
                  const selectedCustomer = customers.find(
                    (customer) => customer.id === e.target.value
                  );
                  setSelectedInstallation({
                    ...selectedInstallation,
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
                value={selectedInstallation.technicianId}
                onChange={(e) => {
                  const selectedTechnician = technicians.find(
                    (technician) => technician.id === e.target.value
                  );
                  setSelectedInstallation({
                    ...selectedInstallation,
                    technicianId: e.target.value,
                    technicianName:
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
            <label className="block text-sm font-medium mb-1">Panels</label>
            <input
              type="number"
              placeholder="Panels"
              className="border p-2 rounded w-full"
              value={selectedInstallation.panels}
              onChange={(e) =>
                setSelectedInstallation({
                  ...selectedInstallation,
                  panels: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Capacity (kW)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Capacity (kW)"
              className="border p-2 rounded w-full"
              value={selectedInstallation.capacityKW}
              onChange={(e) =>
                setSelectedInstallation({
                  ...selectedInstallation,
                  capacityKW: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedInstallation.status}
              onChange={(e) =>
                setSelectedInstallation({
                  ...selectedInstallation,
                  status: e.target.value,
                })
              }
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Efficiency (%)
            </label>
            <input
              type="number"
              placeholder="Efficiency"
              className="border p-2 rounded w-full"
              value={selectedInstallation.efficiency}
              onChange={(e) =>
                setSelectedInstallation({
                  ...selectedInstallation,
                  efficiency: Number(e.target.value),
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
                selectedInstallation.nextMaintenance
                  ? new Date(selectedInstallation.nextMaintenance)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setSelectedInstallation({
                  ...selectedInstallation,
                  nextMaintenance: e.target.value
                    ? new Date(e.target.value)
                    : null,
                })
              }
            />
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={handleUpdateInstallation}
          >
            Update Installation
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Installations;
