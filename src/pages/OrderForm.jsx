import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../api";

export default function OrderForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, userId } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        userId: user || userId,
        items: [{ itemId: "", quantity: 1 }]
    });
    const [availableItems, setAvailableItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderStatus, setOrderStatus] = useState(null);

    useEffect(() => {
        const emailLike = user || userId;
        if (emailLike && !isEdit) {
            setFormData(prev => ({ ...prev, userId: emailLike }));
        }
    }, [user, userId, isEdit]);

    useEffect(() => {
        fetchAvailableItems();
    }, []);

    const fetchAvailableItems = async () => {
        try {
            setItemsLoading(true);
            const mockItemIds = [1, 2, 3, 4, 5];
            const idsParam = mockItemIds.join(',');

            const res = await api.get(`/orders/items?ids=${idsParam}`);
            setAvailableItems(res.data);
        } catch (err) {
            console.error("Error fetching items:", err);
            setAvailableItems([
                { id: 1, name: "Laptop", price: 999.99 },
                { id: 2, name: "Smartphone", price: 699.99 },
                { id: 3, name: "Tablet", price: 399.99 },
                { id: 4, name: "Headphones", price: 149.99 },
                { id: 5, name: "Monitor", price: 249.99 }
            ]);
        } finally {
            setItemsLoading(false);
        }
    };

    const fetchOrder = useCallback(async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            const order = res.data;
            setFormData({
                userId: order.userId,
                items: order.orderItems ? order.orderItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity
                })) : [{ itemId: "", quantity: 1 }]
            });
            setOrderStatus(order.status || null);
        } catch {
            setError("Failed to fetch order");
        }
    }, [id]);

    useEffect(() => {
        if (isEdit && userId) {
            fetchOrder();
        }
    }, [isEdit, fetchOrder, userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const hasEmptyItems = formData.items.some(item => !item.itemId);
        if (hasEmptyItems) {
            setError("Please select products for all items");
            setLoading(false);
            return;
        }

        try {
            if (isEdit) {
                const updateData = {
                    userId: formData.userId,
                    items: formData.items.map(i => ({
                        itemId: Number(i.itemId),
                        quantity: Number(i.quantity)
                    }))
                };
                await api.put(`/orders/${id}`, updateData);
            } else {
                const createData = {
                    userId: formData.userId,
                    items: formData.items.map(i => ({
                        itemId: Number(i.itemId),
                        quantity: Number(i.quantity)
                    }))
                };
                await api.post("/orders/create", createData);
            }
            navigate("/orders");
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data;
            const errorMessage = backendMsg || (isEdit ? "Failed to update order" : "Failed to create order");
            setError(errorMessage);
            console.error("Error saving order:", err);
        } finally {
            setLoading(false);
        }
    };

    // Остальные функции (handleItemChange, addItem, removeItem) остаются без изменений
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemId: "", quantity: 1 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const updatedItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                items: updatedItems
            }));
        }
    };

    return (
        <div className="container" style={{ maxWidth: "600px" }}>
            <h2 className="mb-4">{isEdit ? "Edit Order" : "Create New Order"}</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {isEdit && orderStatus && orderStatus !== 'PENDING' && (
                <div className="alert alert-warning">
                    Only PENDING orders can be updated. Current status: {orderStatus}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label fw-bold">Order Items</label>
                    {itemsLoading && <div className="text-center mb-3">Loading products...</div>}

                    {formData.items.map((item, index) => (
                        <div key={index} className="card mb-3">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Product</label>
                                        <select
                                            className="form-select"
                                            value={item.itemId}
                                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                            required
                                            disabled={isEdit && orderStatus && orderStatus !== 'PENDING'}
                                        >
                                            <option value="">Select a product</option>
                                            {availableItems.map(availableItem => (
                                                <option key={availableItem.id} value={availableItem.id}>
                                                    {availableItem.name} - ${availableItem.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            required
                                            disabled={isEdit && orderStatus && orderStatus !== 'PENDING'}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        {formData.items.length > 1 && !(isEdit && orderStatus && orderStatus !== 'PENDING') && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removeItem(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={addItem}
                        disabled={isEdit && orderStatus && orderStatus !== 'PENDING'}
                    >
                        + Add Another Item
                    </button>
                </div>

                <div className="d-grid gap-2">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || itemsLoading || (isEdit && orderStatus && orderStatus !== 'PENDING')}
                    >
                        {loading ? "Saving..." : "Save Order"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/orders")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}