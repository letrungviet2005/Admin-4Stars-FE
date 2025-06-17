import React, { useEffect, useState } from "react";
import config from "../../config/config";
import { useNavigate } from "react-router";

interface Category {
  id: number;
  name: string;
  description?: string;
  orderIndex?: number;
  parentId?: number | null;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  subCategories?: Category[];
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInputs, setEditInputs] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "VOCABULARY",
    orderIndex: 1,
    parentId: null,
  });
  const accessToken = localStorage.getItem("accessToken");

  // Phân trang
  const [page, setPage] = useState(1);
  const size = 6;
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${config}admin/categories?page=${page}&size=${size}&type=VOCABULARY`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();

      if (data.statusCode === 200 && data.data?.result) {
        setCategories(data.data.result);
        const total = data.data.meta.total;
        setTotalPages(total);
        console.log(total);
        const calculatedTotalPages = Math.ceil(total / size);
        setTotalPages(calculatedTotalPages || 1);
      } else {
        console.error("Invalid response:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleAddCategory = async () => {
    try {
      const response = await fetch(config + `admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error("Failed to add category");

      setShowAddForm(false);
      setNewCategory({
        name: "",
        description: "",
        type: "VOCABULARY",
        orderIndex: 1,
        parentId: null,
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditInputs({
      name: cat.name,
      description: cat.description || "",
      type: cat.type || "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`${config}vocabulary-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(editInputs),
      });

      if (!response.ok)
        throw new Error(`Failed to edit category with ID: ${id}`);

      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${config}vocabulary-categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to delete category with ID: ${id}`);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📂 Vocabulary Categories
          </h2>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            ➕ Thêm chủ đề
          </button>
        </div>

        {showAddForm && (
          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              ➕ Thêm Chủ Đề Mới
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tên chủ đề
                </label>
                <input
                  name="name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Loại
                </label>
                <input
                  name="type"
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Thứ tự (orderIndex)
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={newCategory.orderIndex}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      orderIndex: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleAddCategory}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-md"
              >
                ✅ Lưu
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white shadow-md rounded-xl p-4 border border-gray-200 relative"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              {editingId === cat.id ? (
                <>
                  <button
                    className="text-green-500"
                    onClick={() => handleSave(cat.id)}
                  >
                    ✅
                  </button>
                  <button
                    className="text-gray-500"
                    onClick={() => setEditingId(null)}
                  >
                    ❌
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="text-blue-500"
                    onClick={() => handleEditClick(cat)}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(cat.id)}
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>

            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editInputs.name}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full mb-2 mt-5"
                />
                <textarea
                  name="description"
                  value={editInputs.description}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full mb-2"
                />
                <input
                  type="text"
                  name="type"
                  value={editInputs.type}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </>
            ) : (
              <>
                <h3
                  onClick={() => navigate(`/vocabulary?category=${cat.id}`)}
                  className="cursor-pointer text-lg font-semibold text-blue-600 mb-2 mt-5"
                >
                  {cat.name}
                </h3>
                {cat.description && (
                  <p
                    onClick={() => navigate(`/vocabulary?category=${cat.id}`)}
                    className="cursor-pointer text-sm text-gray-600"
                  >
                    {cat.description}
                  </p>
                )}
                <p
                  onClick={() => navigate(`/vocabulary?category=${cat.id}`)}
                  className="cursor-pointer text-xs text-gray-500 mt-3"
                >
                  Type: {cat.type}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          ⬅️ Trước
        </button>
        <span className="px-4 py-2 font-medium text-gray-700">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Tiếp ➡️
        </button>
      </div>
    </div>
  );
};

export default Categories;
