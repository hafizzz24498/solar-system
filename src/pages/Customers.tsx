// --- Customers.tsx ---
import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import Map from "../components/Map";
import { useNavigate } from "react-router";

// Customer type definition
interface Customer {
  id: string;
  name: string;
  province: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  lastCleanDate: Date | null;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: "",
    name: "",
    province: "",
    address: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    lastCleanDate: new Date(),
  });
  const navigate = useNavigate();

  const fetchCustomers = async (page = 1, nameQuery = "") => {
    try{
        const res = await api.get("/customers", {
      params: { page, limit: 10, name: nameQuery },
    });
    setCustomers(res.data.data);
    setTotalPages(res.data.meta.lastPage);
    } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as any).response?.status === 401
        ) {
          navigate('/login');
        }else{
            alert("Failed to fetch customers");
        }
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, name);
  }, [currentPage, name, province]);

  const handleDelete = async (customer: Customer) => {
    console.log("Deleting customer with ID:", customer.id);
    console.log("Full customer object:", customer);
    // Add confirmation dialog
    if (!confirm(`Are you sure you want to delete this customer?`)) {
      return;
    }

    try {
      await api.delete(`/customers/${customer.id}`);
      fetchCustomers(currentPage, name);
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCreateCustomer = async () => {
    await api.post("/customers", {
      name: newCustomer.name,
      province: newCustomer.province,
      address: newCustomer.address,
      phone: newCustomer.phone,
      latitude: newCustomer.latitude,
      longitude: newCustomer.longitude,
    });
    setShowCreateModal(false);
    fetchCustomers(currentPage, name);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    await api.patch(`/customers/${selectedCustomer.id}`, selectedCustomer);
    setShowModal(false);
    fetchCustomers(currentPage, name);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
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
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-4 shadow rounded border hover:border-yellow-400"
          >
            <h2 className="font-semibold text-lg">{customer.name}</h2>
            <p className="text-sm text-gray-600">
              {customer.address}, {customer.province}
            </p>
            <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
            <p className="text-sm text-gray-600">
              Last Cleaned:{" "}
              {customer.lastCleanDate
                ? new Date(customer.lastCleanDate).toLocaleDateString()
                : ""}{" "}
            </p>
            {customer.latitude && customer.longitude && (
              <a
                href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm inline-block mt-2"
              >
                View on Google Maps
              </a>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openModal(customer)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "Delete button clicked for customer:",
                    customer.id
                  ); // Debug log
                  handleDelete(customer);
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
          <h2 className="text-lg font-bold mb-2">Create Customer</h2>
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Province"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, province: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Phone"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Lat"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                latitude: Number(e.target.value),
              })
            }
          />
          <input
            type="number"
            placeholder="Lng"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                longitude: Number(e.target.value),
              })
            }
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleCreateCustomer}
          >
            Create
          </button>
        </Modal>
      )}

      {showModal && selectedCustomer && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-bold mb-2">Edit Customer</h2>
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.name}
            onChange={(e) =>
              setSelectedCustomer({ ...selectedCustomer, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Province"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.province}
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                province: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.address}
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                address: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Phone"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.phone}
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                phone: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Latitude"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.latitude}
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                latitude: Number(e.target.value),
              })
            }
          />
          <input
            type="text"
            placeholder="Longitude"
            className="border p-2 rounded w-full mb-2"
            value={selectedCustomer.longitude}
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                longitude: Number(e.target.value),
              })
            }
          />
          <input
            type="date"
            className="border p-2 rounded w-full mb-2"
            value={
              selectedCustomer.lastCleanDate
                ? new Date(selectedCustomer.lastCleanDate)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedCustomer({
                ...selectedCustomer,
                lastCleanDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleUpdateCustomer}
          >
            Update
          </button>
        </Modal>
      )}

      {/* <div className="mt-10">
        <h2 className="font-bold text-lg mb-2">Customer Map</h2>
        <Map
          locations={customers
            .filter(
              (c) => typeof c.lat === "number" && typeof c.lng === "number"
            )
            .map((c) => ({
              lat: c.lat as unknown as number,
              lng: c.lng as unknown as number,
              name: c.name,
              // add other Location properties if needed
            }))}
        />
      </div> */}
    </div>
  );
};
export default Customers;
