import React, { useEffect, useState } from "react";
import config from "../../config/config";

interface Category {
  id: number;
  name: string;
}

interface VideoItem {
  id: number;
  title: string;
  url: string;
  description: string;
  duration: string;
  subtitle: string;
  category: Category;
  createdAt: string;
}

const Video: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 3;

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `${config}admin/videos?page=${page}&size=${size}&sort=id,asc`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setVideos(data.data.result);
        setTotalPages(data.data.meta.pages);
      } catch (error) {
        console.error("Lỗi khi tải video:", error);
      }
    };

    fetchVideos();
  }, [page]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        🎥 Video Bài Học
      </h1>
      <div>
        <input
          type="text"
          placeholder="🔍 Tìm video bài học..."
          className="mb-6 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="border border-gray-300 rounded-lg shadow p-4 flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
            <p className="text-sm text-gray-600 mb-1">{video.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              ⏱️ Thời lượng: {video.duration}
            </p>
            <video
              src={video.url}
              controls
              className="w-full max-h-[400px] mb-3 rounded"
            >
              <track src={video.subtitle} kind="subtitles" label="Phụ đề" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
            <div className="text-xs text-gray-500">
              <p>📂 Danh mục: {video.category.name}</p>
              <p>🗓️ Ngày đăng: {new Date(video.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ⬅️ Trang trước
        </button>
        <span className="font-medium">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Trang sau ➡️
        </button>
      </div>
    </div>
  );
};

export default Video;
