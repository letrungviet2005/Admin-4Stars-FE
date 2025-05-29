import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import config from "../../config/config";
import { useSearchParams } from "react-router";

interface Vocabulary {
  id: number;
  word: string;
  definition_en?: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  part_of_speech?: string;
  pronunciation?: string;
  image?: string;
  audio?: string;
  category_id: number;
}

const Vocabulary: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vocabulary>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category"); 

  useEffect(() => {
    loadVocabularies();
  }, [category]); // 👈 Gọi lại khi `category` thay đổi

  const loadVocabularies = () => {
    const endpoint = category
      ? `${config}admin/vocabularies/by-category/${category}`
      : `${config}admin/vocabularies`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setVocabularies(data))
      .catch((err) => console.error("Error loading vocabularies:", err));
  };

  const startEdit = (vocab: Vocabulary) => {
    setEditingId(vocab.id);
    setEditForm({
      word: vocab.word,
      meaning_vi: vocab.meaning_vi,
      example_en: vocab.example_en,
      example_vi: vocab.example_vi,
      definition_en: vocab.definition_en || "",
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
      const response = await fetch(config + `admin/vocabularies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update vocabulary");
      }
      setEditingId(null);
      setEditForm({});
      loadVocabularies();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi cập nhật từ vựng!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa từ này không?")) return;

    try {
      const response = await fetch(config + `admin/vocabularies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vocabulary");
      }
      loadVocabularies();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa từ vựng!");
    }
  };

  const filteredVocabularies = vocabularies.filter((vocab) =>
    vocab.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-semibold flex items-center gap-2">
          <span>📚</span> Vocabulary List
        </h2>
        <button
          onClick={() => {}} // Bạn có thể thêm logic thêm từ ở đây
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
        >
          + Thêm từ vựng
        </button>
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
                      name="definition_en"
                      value={editForm.definition_en || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="English Definition"
                      rows={2}
                    />
                    <input
                      type="text"
                      name="meaning_vi"
                      value={editForm.meaning_vi || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Meaning (Vietnamese)"
                    />
                    <input
                      type="text"
                      name="example_en"
                      value={editForm.example_en || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Example (English)"
                    />
                    <input
                      type="text"
                      name="example_vi"
                      value={editForm.example_vi || ""}
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
                        <em className="text-gray-500 ml-2">{vocab.pronunciation}</em>
                      )}
                      {vocab.part_of_speech && (
                        <span className="italic text-gray-400 ml-3">
                          ({vocab.part_of_speech})
                        </span>
                      )}
                    </div>

                    {vocab.definition_en && (
                      <p className="text-gray-700 text-sm mt-1">{vocab.definition_en}</p>
                    )}

                    <p className="mt-1">
                      <strong>VI:</strong> {vocab.meaning_vi}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>EN Example:</strong> {vocab.example_en}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>VI Example:</strong> {vocab.example_vi}
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
    </div>
  );
};

export default Vocabulary;
