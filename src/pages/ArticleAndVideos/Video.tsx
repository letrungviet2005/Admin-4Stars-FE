import React, { useEffect, useState } from "react";

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
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/videos?page=1&size=3&sort=id,asc",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setVideos(data.data.result);
      } catch (error) {
        console.error("Lỗi khi tải video:", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        🎥 Video Bài Học
      </h1>

      {videos.map((video) => (
        <div
          key={video.id}
          className="mb-8 border border-gray-300 rounded-lg shadow p-4"
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
  );
};

export default Video;
