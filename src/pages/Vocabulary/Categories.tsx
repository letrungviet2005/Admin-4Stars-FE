import React, { useEffect, useState } from 'react';
import config from '../../config/config';
import { useNavigate } from 'react-router';

interface Category {
  id: number;
  name: string;
  description?: string;
  order_index?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [editInputs, setEditInputs] = useState({
    name: '',
    description: '',
    type: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    type: ''
  });

  const handleAddCategory = async () => {
    try {
      const response = await fetch(`${config}admin/vocabulary-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) throw new Error('Failed to add category');

      const created = await response.json();
      setCategories(prev => [...prev, created]);
      setShowAddForm(false);
      setNewCategory({ name: '', description: '', type: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditInputs({
      name: cat.name,
      description: cat.description || '',
      type: cat.type || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`${config}admin/vocabulary-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editInputs)
      });

      if (!response.ok) throw new Error(`Failed to edit category with ID: ${id}`);

      const updated = await response.json();
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${config}admin/vocabulary-categories/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error(`Failed to delete category with ID: ${id}`);

      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch(config + 'admin/vocabulary-categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error loading categories:', err));
  }, []);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📂 Vocabulary Categories
          </h2>
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            ➕ Thêm chủ đề
          </button>
        </div>

        {showAddForm && (
          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">➕ Thêm Chủ Đề Mới</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên chủ đề</label>
                <input
                  name="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  placeholder="Nhập tên chủ đề"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại</label>
                <input
                  name="type"
                  value={newCategory.type}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  placeholder="Ví dụ: từ vựng, ngữ pháp..."
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[80px]"
                placeholder="Mô tả ngắn gọn về chủ đề"
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
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition relative"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              {editingId === cat.id ? (
                <>
                  <button className="text-green-500" onClick={() => handleSave(cat.id)}>✅</button>
                  <button className="text-gray-500" onClick={() => setEditingId(null)}>❌</button>
                </>
              ) : (
                <>
                  <button className="text-blue-500" onClick={() => handleEditClick(cat)}>✏️</button>
                  <button className="text-red-500" onClick={() => handleDelete(cat.id)}>🗑️</button>
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
                <h3  onClick={() => navigate(`/vocabulary?category=${cat.id}`)} className="cursor-pointer text-lg font-semibold text-blue-600 mb-2 mt-5">{cat.name}</h3>
                {cat.description && <p  onClick={() => navigate(`/vocabulary?category=${cat.id}`)} className="cursor-pointer text-sm text-gray-600">{cat.description}</p>}
                <p  onClick={() => navigate(`/vocabulary?category=${cat.id}`)} className="cursor-pointer text-xs text-gray-500 mt-3">Type: {cat.type}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
