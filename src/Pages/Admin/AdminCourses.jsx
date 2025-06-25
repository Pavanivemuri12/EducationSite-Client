import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash, X, Search } from "lucide-react";
import { getCourses, deleteCourses, editCourses } from "../../api/api";

const AdminCourses = () => {
  const [courses, setCourses] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const courseNameRef = useRef("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [resetSearch, setResetSearch] = useState(null);


  const uploadToCloudinary = async (file, resourceType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    return data.secure_url;
  };

  const fetchData = async () => {
    try {
      const res = await getCourses();
      if (res.status === 200) {
        setCourses(res.data);
        setFilteredCourses(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const thumbnailUrl = await uploadToCloudinary(thumbnailFile, "image");

      const formData = new FormData();
      formData.append("courseName", courseNameRef.current.value);
      formData.append("thumbnailUrl", thumbnailUrl);
      formData.append("video", videoFile);

      const res = await fetch("http://localhost:3000/courses/add", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add course");
      }

      const data = await res.json();
      setShowAdd(false);
      toast.success("Course Added");
      setCourses((prevCourses) => [...prevCourses, data.course]);
    } catch (error) {
      toast.error("Error while Adding");
      console.error("error while adding", error);
    } finally {
      setAdding(false);
    }
  };

  const resetAddForm = () => {
    courseNameRef.current.value = "";
    setThumbnailFile(null);
    setVideoFile(null);
  };

  const editHelper = (product) => {
    setCurrentProduct(product);
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);

    try {
      let thumbnailUrl = currentProduct.thumbnailUrl;
      let videoUrl = currentProduct.videoUrl;

      // Upload new thumbnail if selected
      if (editThumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(editThumbnailFile, "image");
      }

      // Upload new video if selected
      if (editVideoFile) {
        videoUrl = await uploadToCloudinary(editVideoFile, "video");
      }

      const updatedProduct = {
        courseName: courseNameRef.current.value,
        thumbnailUrl: thumbnailUrl,
        videoUrl: videoUrl,
      };

      const response = await editCourses(updatedProduct, currentProduct._id);
      if (response.status === 200) {
        setShowEdit(false);
        resetEditForm();
        fetchData();
        toast.success("Course Updated Successfully");
      }
    } catch (error) {
      toast.error("Error while updating course");
      console.error("Error while editing:", error);
    } finally {
      setEditing(false);
    }
  };

  const resetEditForm = () => {
    setCurrentProduct(null);
    setEditThumbnailFile(null);
    setEditVideoFile(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteCourses(id);
      if (response.status === 200) {
        fetchData();
        toast.success("Course Deleted Successfully");
      }
    } catch (error) {
      toast.error("Error while deleting course");
      console.error("Error while deleting:", error);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses?.filter((course) =>
        course.courseName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const getCloudinaryVideoThumbnail = (videoUrl) => {
    // Extract public ID from Cloudinary URL and generate thumbnail
    const matches = videoUrl.match(/\/v\d+\/(.+)\./);
    if (matches) {
      const publicId = matches[1];
      return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/w_200,h_150,c_fill,f_jpg/${publicId}.jpg`;
    }
    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-[90vh] flex flex-col justify-center items-center">
        <Loader2 className="text-lime-500 h-14 w-14 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start items-start px-2 md:px-6">
      <div className="w-full flex flex-col md:flex-row justify-between items-center my-4 shadow-md rounded-md p-3 border gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={resetSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Add Button */}
        <button
          className="w-10 h-10 font-bold flex justify-center items-center border-2 border-green-500 rounded-md text-green-500 shadow-md hover:text-white hover:bg-green-500 hover:shadow-md hover:shadow-green-400 flex-shrink-0"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Results Info */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredCourses?.length || 0} course(s) matching &quot;{searchTerm}&quot;
        </div>
      )}

      {/* Responsive table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[600px] md:min-w-full border-collapse border shadow-lg rounded-md">
          <thead className="shadow-md font-bold text-lime-500 text-left rounded-md bg-lime-100">
            <tr>
              <th className="p-4 md:p-6">Course ID</th>
              <th className="p-4 md:p-6">Course Name</th>
              <th className="p-4 md:p-6">Thumbnail</th>
              <th className="p-4 md:p-6">Video Preview</th>
              <th className="p-4 md:p-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses?.length > 0 ? (
              filteredCourses.map((product, index) => (
                <tr
                  key={index}
                  className="border-b last:border-none hover:bg-lime-50 transition-colors"
                >
                  <td className="p-2 md:p-4 break-all text-sm">{product._id}</td>
                  <td className="p-2 md:p-4 break-words max-w-[150px] md:max-w-none">
                    {product.courseName}
                  </td>
                  <td className="p-2 md:p-4">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.courseName}
                      className="h-12 w-12 object-cover rounded-md shadow-md"
                    />
                  </td>
                  <td className="p-2 md:p-4">
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedVideo(product.videoUrl)}
                    >
                      <img
                        src={getCloudinaryVideoThumbnail(product.videoUrl) || product.thumbnailUrl}
                        alt="Video preview"
                        className="h-12 w-16 object-cover rounded-md shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <div className="text-white text-xs">▶ Play</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="border-blue-500 border-2 p-2 rounded-md text-blue-500 shadow-md hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors"
                        onClick={() => editHelper(product)}
                        aria-label={`Edit course ${product.courseName}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="border-red-500 border-2 p-2 rounded-md text-red-500 shadow-md hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                        onClick={() => handleDelete(product._id)}
                        aria-label={`Delete course ${product.courseName}`}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  {searchTerm ? `No courses found matching "${searchTerm}"` : "No courses available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed top-0 left-0 z-50 h-screen w-screen flex justify-center items-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-md flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <div className="w-[90%] flex justify-between items-center mt-4">
              <h1 className="text-xl font-bold text-green-500">Add Course</h1>
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setShowAdd(false);
                  resetAddForm();
                }}
              />
            </div>
            <form
              className="w-[90%] flex flex-col gap-4 mt-6 mb-6"
              onSubmit={handleAdd}
            >
              <input
                ref={courseNameRef}
                type="text"
                placeholder="Course Name"
                required
                className="p-2 bg-[#f5f5f7] border-b-2 focus:border-lime-400 outline-none rounded-sm w-full"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Course Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className={`h-12 rounded-md shadow-md text-white flex items-center justify-center gap-2 w-full transition-colors
                  ${
                    adding
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
              >
                {adding && <Loader2 className="animate-spin h-5 w-5" />}
                {adding ? "Uploading..." : "Add Course"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-red-500 hover:bg-red-500 hover:text-white border border-red-500 rounded-full p-1 z-10"
              onClick={() => setSelectedVideo(null)}
              aria-label="Close video"
            >
              <X />
            </button>
            <video
              controls
              width="100%"
              height="500px"
              className="rounded-md max-w-full"
              src={selectedVideo}
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed top-0 left-0 z-50 h-screen w-screen flex justify-center items-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-md flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <div className="w-[90%] flex justify-between items-center mt-4">
              <h1 className="text-xl font-bold text-green-500">Edit Course</h1>
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setShowEdit(false);
                  resetEditForm();
                }}
              />
            </div>
            <form
              className="w-[90%] flex flex-col gap-4 mt-6 mb-6"
              onSubmit={handleEdit}
            >
              <input
                ref={courseNameRef}
                defaultValue={currentProduct?.courseName}
                type="text"
                placeholder="Course Name"
                required
                className="p-2 bg-[#f5f5f7] border-b-2 focus:border-lime-400 outline-none rounded-sm w-full"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Update Thumbnail (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditThumbnailFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {currentProduct?.thumbnailUrl && (
                  <div className="mt-2">
                    <img
                      src={currentProduct.thumbnailUrl}
                      alt="Current thumbnail"
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current thumbnail</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Update Video (optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEditVideoFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {currentProduct?.videoUrl && (
                  <div className="mt-2">
                    <img
                      src={getCloudinaryVideoThumbnail(currentProduct.videoUrl) || currentProduct.thumbnailUrl}
                      alt="Current video preview"
                      className="h-16 w-20 object-cover rounded-md border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current video</p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={editing}
                className={`h-12 rounded-md shadow-md text-white flex items-center justify-center gap-2 w-full transition-colors
                  ${
                    editing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
              >
                {editing && <Loader2 className="animate-spin h-5 w-5" />}
                {editing ? "Updating..." : "Update Course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;