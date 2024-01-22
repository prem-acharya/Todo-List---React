// Homepage.js
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate, Link } from "react-router-dom";  // Import Link for navigation
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";

export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputError, setInputError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "User");
        setUserEmail(user.email || "");
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setTodos([]);
          const data = snapshot.val();
          if (data !== null) {
            Object.values(data).forEach((todo) => {
              setTodos((oldArray) => [...oldArray, todo]);
            });
          }
        });
      } else {
        setUsername("");
        setUserEmail("");
        navigate("/");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    document.title = `Todo List - ${username || userEmail}`;
  }, [username, userEmail]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUsername("");
        setUserEmail("");
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const validateInput = () => {
    if (!todo.trim()) {
      setInputError("Task cannot be empty!");
      return false;
    }
    setInputError("");
    return true;
  };

  const writeToDatabase = () => {
    if (validateInput()) {
      const uidd = uid();
      set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
        todo: todo,
        uidd: uidd,
        completed: false,
        description: description,
        link: link,
        images: images,
      });

      setTodo("");
      setDescription("");
      setLink("");
      setImages([]);
    }
  };

  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTodo(todo.todo);
    setDescription(todo.description || "");
    setLink(todo.link || "");
    setImages(todo.images || []);
    setTempUidd(todo.uidd);
  };

  const handleEditConfirm = () => {
    if (validateInput()) {
      update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
        todo: todo,
        description: description,
        link: link,
        images: images,
        tempUidd: tempUidd,
      });

      setTodo("");
      setDescription("");
      setLink("");
      setImages([]);
      setIsEdit(false);
    }
  };

  const handleDelete = (uid) => {
    remove(ref(db, `/${auth.currentUser.uid}/${uid}`));
  };

  const handleCompleteToggle = (uid, completed) => {
    update(ref(db, `/${auth.currentUser.uid}/${uid}`), {
      completed: !completed,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      writeToDatabase();
    }
  };

  const handleImageUpload = async (files) => {
    const newImages = [...images];

    const readFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    };

    const uploadImages = async () => {
      for (const file of files) {
        const image = await readFile(file);
        newImages.push(image);
      }
      setImages([...newImages]);
    };

    uploadImages();
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const isAdmin = auth.currentUser?.email === "admin@admin.com"; // Define isAdmin here

  return (
    <div className="homepage bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">
        Welcome to Todo List, {username || userEmail}
      </h1>
      <div className="w-full max-w-md mb-4 relative">
        <input
          className={`add-edit-input p-2 pr-8 border rounded border-gray-300 w-full ${
            inputError ? "border-red-500" : ""
          }`}
          type="text"
          placeholder="Add todo..."
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {isEdit ? (
          <CheckIcon
            onClick={handleEditConfirm}
            className="add-confirm-icon cursor-pointer text-green-500 absolute right-2 top-2"
          />
        ) : (
          <AddIcon
            onClick={writeToDatabase}
            onKeyPress={handleKeyPress}
            className="add-confirm-icon cursor-pointer text-green-500 absolute right-2 top-2"
          />
        )}
      </div>

      <div
        onClick={() => document.getElementById("imageInput").click()}
        onDrop={(e) => handleImageDrop(e)}
        onDragOver={(e) => e.preventDefault()}
        className="drop-area border-dashed border-2 border-gray-300 p-2 w-full max-w-md rounded text-center cursor-pointer flex items-center justify-center transition duration-300 hover:bg-gray-100 hover:border-gray-500"
      >
        {images.length > 0 ? (
          <div className="flex flex-wrap">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Selected ${index + 1}`}
                className="w-20 h-20 object-cover rounded m-2 cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        ) : (
          "Upload Image"
        )}
      </div>

      <input
        id="imageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files)}
        onClick={(e) => (e.target.value = null)}
        multiple
      />

      <div className="w-full max-w-md p-2 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400  scrollbar-track-gray-200 rounded-md mt-4 max-h-80">
        {todos.map((todo) => (
          <div
            key={todo.uidd}
            className={`todo flex items-center justify-between bg-white p-2 mb-2 rounded border border-gray-300 ${
              todo.completed ? "completed" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className="cursor-pointer mr-2"
                onClick={() => handleCompleteToggle(todo.uidd, todo.completed)}
              >
                {todo.completed ? "👍" : "👎"}
              </div>
              <div>
                <h1 className="text-lg">{todo.todo}</h1>
                {todo.description && (
                  <p className="text-gray-500">{todo.description}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {todo.link && (
                <a href={todo.link} target="_blank" rel="noopener noreferrer">
                  Open Link
                </a>
              )}
              {todo.images && (
                <div className="flex flex-wrap">
                  {todo.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Selected ${index + 1}`}
                      className="w-10 h-10 object-cover rounded m-1 cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    />
                  ))}
                </div>
              )}
              <EditIcon
                fontSize="large"
                onClick={() => handleUpdate(todo)}
                className="edit-button cursor-pointer text-blue-500"
              />
              <DeleteIcon
                fontSize="large"
                onClick={() => handleDelete(todo.uidd)}
                className="delete-button cursor-pointer text-red-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 mt-4 bg-red-600 rounded border border-gray-300">
        <button
          onClick={handleSignOut}
          className="logout-btn cursor-pointer text-white flex items-center"
        >
          <LogoutIcon className="mr-2" />
          Logout
        </button>
      </div>

      {selectedImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-full custom-max-w-50"
          />
        </div>
      )}
      {isAdmin && (
        <div className="p-2 mt-4 bg-green-500 rounded border border-gray-300">
          <Link to="/admin" className="admin-link cursor-pointer text-white">
            Admin Page
          </Link>
        </div>
      )}
    </div>
  );
}
