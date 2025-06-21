import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import config from "../../config/config";

interface Vocabulary {
  id: number;
  word: string;
  definitionEn: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  partOfSpeech?: string;
  pronunciation?: string;
  image?: string;
  audio?: string;
  categoryId: number;
}

const Vocabulary: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vocabulary>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const accessToken = localStorage.getItem("accessToken");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addVocabulary, setAddVocabulary] = useState(false);
  const [newVocabulary, setNewVocabulary] = useState<
    Vocabulary & { categoryId: number }
  >({
    id: 0,
    word: "",
    pronunciation: "",
    partOfSpeech: "",
    definitionEn: "",
    meaningVi: "",
    exampleEn: "",
    exampleVi: "",
    audio: "",
    image: "",
    categoryId: Number(category) || 0,
  });

  useEffect(() => {
    loadVocabularies(currentPage);
  }, [category, currentPage]);

  const handleAddVocalabulary = async () => {
    try {
      // Kiểm tra các trường bắt buộc
      if (
        !newVocabulary.word ||
        !newVocabulary.meaningVi ||
        !newVocabulary.categoryId
      ) {
        alert(
          "Vui lòng điền các trường bắt buộc: từ, nghĩa tiếng Việt và danh mục"
        );
        return;
      }

      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        word: newVocabulary.word,
        pronunciation: newVocabulary.pronunciation || null,
        partOfSpeech: newVocabulary.partOfSpeech || null,
        definitionEn: newVocabulary.definitionEn || null,
        meaningVi: newVocabulary.meaningVi,
        exampleEn: newVocabulary.exampleEn || null,
        exampleVi: newVocabulary.exampleVi || null,
        audio: newVocabulary.audio || null,
        image: newVocabulary.image || null,
        categoryId: newVocabulary.categoryId,
      };

      console.log("Payload:", payload); // Kiểm tra dữ liệu trước khi gửi

      const response = await fetch(`${config}admin/vocabularies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Đảm bảo có token
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status); // Kiểm tra mã trạng thái

      if (!response.ok) {
        const errorData = await response.json(); // Lấy thông báo lỗi từ server
        console.error("Error details:", errorData);
        throw new Error(errorData.message || "Failed to add vocabulary");
      }

      // Reset form sau khi thành công
      setNewVocabulary({
        id: 0,
        word: "",
        pronunciation: "",
        partOfSpeech: "",
        definitionEn: "",
        meaningVi: "",
        exampleEn: "",
        exampleVi: "",
        audio: "",
        image: "",
        categoryId: Number(category) || 0,
      });
      setAddVocabulary(false);
      loadVocabularies(1); // Load lại trang đầu tiên

      alert("Thêm từ vựng thành công!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Lỗi khi thêm từ vựng: ${error.message}`);
    }
  };

  const loadVocabularies = async (page: number) => {
    try {
      const size = 5;
      const sort = "id,asc";

      const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
      });

      if (category) {
        queryParams.append("categoryId", category);
      }

      const endpoint = `${config}admin/vocabularies?${queryParams.toString()}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Raw data from API:", data);

      if (data && data.data && Array.isArray(data.data.result)) {
        setVocabularies(data.data.result);
        // Lấy tổng số trang từ phản hồi (nếu có)
        setTotalPages(data.data.meta.total);
      } else {
        setVocabularies([]);
        setTotalPages(1);
        console.warn(
          "No vocabularies found or data format is incorrect.",
          data
        );
      }
    } catch (err) {
      console.error("Error loading vocabularies:", err);
      setVocabularies([]);
      setTotalPages(1);
    }
  };

  const startEdit = (vocab: Vocabulary) => {
    setEditingId(vocab.id);
    setEditForm({
      word: vocab.word,
      definitionEn: vocab.definitionEn,
      meaningVi: vocab.meaningVi,
      exampleEn: vocab.exampleEn,
      exampleVi: vocab.exampleVi,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`${config}admin/vocabularies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newVocabulary),
      });

      if (!response.ok) throw new Error("Failed to update vocabulary");

      setEditingId(null);
      setEditForm({});
      loadVocabularies(currentPage);
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi cập nhật từ vựng!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa từ này không?")) return;
    try {
      const response = await fetch(`${config}admin/vocabularies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete vocabulary");

      loadVocabularies(currentPage);
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa từ vựng!");
    }
  };
  const ToggleaddVocabulary = () => {
    setAddVocabulary(!addVocabulary);
  };

  const filteredVocabularies = vocabularies.filter((vocab) =>
    vocab.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid-cols-1 md:grid-cols-2">
      <div className="bg-gray-100 p-4 rounded-md shadow mb-6">
        {!addVocabulary ? (
          <button
            className="text-lg font-semibold mb-3"
            onClick={() => ToggleaddVocabulary()}
          >
            ➕ Thêm từ vựng mới
          </button>
        ) : (
          <button
            className="text-lg font-semibold mb-3"
            onClick={() => ToggleaddVocabulary()}
          >
            ❌ Hủy thêm từ vựng
          </button>
        )}
        {addVocabulary && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Word"
                value={newVocabulary.word}
                onChange={(e) =>
                  setNewVocabulary({ ...newVocabulary, word: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Pronunciation"
                value={newVocabulary.pronunciation}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    pronunciation: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Part of Speech"
                value={newVocabulary.partOfSpeech}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    partOfSpeech: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Definition (English)"
                value={newVocabulary.definitionEn}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    definitionEn: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Meaning (Vietnamese)"
                value={newVocabulary.meaningVi}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    meaningVi: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Example (English)"
                value={newVocabulary.exampleEn}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    exampleEn: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Example (Vietnamese)"
                value={newVocabulary.exampleVi}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    exampleVi: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Audio URL"
                value={newVocabulary.audio}
                onChange={(e) =>
                  setNewVocabulary({ ...newVocabulary, audio: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newVocabulary.image}
                onChange={(e) =>
                  setNewVocabulary({ ...newVocabulary, image: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Category ID"
                value={newVocabulary.categoryId}
                onChange={(e) =>
                  setNewVocabulary({
                    ...newVocabulary,
                    categoryId: parseInt(e.target.value),
                  })
                }
                className="border px-3 py-2 rounded"
              />
            </div>

            <button
              onClick={handleAddVocalabulary}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              ✅ Thêm từ
            </button>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="🔍 Tìm từ vựng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredVocabularies.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy từ nào.</p>
      ) : (
        <ul className="space-y-6">
          {filteredVocabularies.map((vocab) => (
            <li
              key={vocab.id}
              className="flex gap-6 items-center bg-white shadow-md rounded-lg p-4"
            >
              {vocab.image && (
                <img
                  src={vocab.image}
                  alt={vocab.word}
                  className="w-20 h-20 object-contain rounded-md flex-shrink-0"
                />
              )}

              <div className="flex-1">
                {editingId === vocab.id ? (
                  <>
                    <input
                      type="text"
                      name="word"
                      value={editForm.word || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Word"
                    />
                    <textarea
                      name="definitionEn"
                      value={editForm.definitionEn || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="English Definition"
                      rows={2}
                    />
                    <input
                      type="text"
                      name="meaningVi"
                      value={editForm.meaningVi || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Meaning (Vietnamese)"
                    />
                    <input
                      type="text"
                      name="exampleEn"
                      value={editForm.exampleEn || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Example (English)"
                    />
                    <input
                      type="text"
                      name="exampleVi"
                      value={editForm.exampleVi || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Example (Vietnamese)"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
                      <span>{vocab.word}</span>
                      {vocab.pronunciation && (
                        <em className="text-gray-500 ml-2">
                          {vocab.pronunciation}
                        </em>
                      )}
                      {vocab.partOfSpeech && (
                        <span className="italic text-gray-400 ml-3">
                          ({vocab.partOfSpeech})
                        </span>
                      )}
                    </div>

                    {vocab.definitionEn && (
                      <p className="text-gray-700 text-sm mt-1">
                        {vocab.definitionEn}
                      </p>
                    )}

                    <p className="mt-1">
                      <strong>VI:</strong> {vocab.meaningVi}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>EN Example:</strong> {vocab.exampleEn}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>VI Example:</strong> {vocab.exampleVi}
                    </p>

                    {vocab.audio && (
                      <audio
                        controls
                        src={vocab.audio}
                        className="mt-3 w-full max-w-xs"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[70px]">
                {editingId === vocab.id ? (
                  <>
                    <button
                      onClick={() => handleSave(vocab.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Done
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(vocab)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(vocab.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ◀ Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Sau ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;
