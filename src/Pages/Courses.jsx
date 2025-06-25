import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getCourses } from "../api/api.jsx";

// Convert Google Drive URLs to embeddable preview URLs
const convertToPlayableURL = (url) => {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
};

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        const formattedCourses = Array.isArray(response.data)
          ? response.data.map(({ courseName, thumbnailUrl, videoUrl, _id }) => ({
              id: _id,
              courseName,
              thumbnailUrl,
              videoUrl,
            }))
          : [];
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading courses...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (courses.length === 0) return <p className="text-center mt-10 text-gray-500">No courses available.</p>;

  return (
    <div className="flex flex-col items-center px-4 py-6 bg-gray-100 min-h-screen">
      {/* Search input */}
      <div className="w-full max-w-xl mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Video Player or Thumbnails */}
      {currentVideo && !showThumbnails ? (
        <div className="w-full max-w-3xl mb-4 aspect-video">
          {currentVideo.includes("drive.google.com") ? (
            <iframe
              src={convertToPlayableURL(currentVideo)}
              width="100%"
              height="100%"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="rounded-lg shadow-lg"
              title="Course Video"
            />
          ) : (
            <video controls autoPlay className="w-full h-full rounded-lg shadow-lg">
              <source src={currentVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(({ id, courseName, thumbnailUrl, videoUrl }) => (
              <div
                key={id}
                className="cursor-pointer bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:scale-[1.02]"
                onClick={() => {
                  setCurrentVideo(videoUrl);
                  setShowThumbnails(false);
                }}
              >
                <img
                  src={thumbnailUrl}
                  alt={courseName}
                  className="w-full h-48 sm:h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-800">{courseName}</h3>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">No matching courses found.</p>
          )}
        </div>
      )}

      {/* Back to Thumbnails Button */}
      {!showThumbnails && (
        <button
          className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg z-10 transition hover:scale-105 active:scale-95"
          onClick={() => {
            setCurrentVideo(null);
            setShowThumbnails(true);
          }}
          aria-label="Back to courses list"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );
};

export default CoursesList;
