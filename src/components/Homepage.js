import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";

export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
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
            Object.values(data).map((todo) => {
              setTodos((oldArray) => [...oldArray, todo]);
            });
          }
        });
      } else if (!user) {
        navigate("/");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
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
        image: image,
      });

      setTodo("");
      setDescription("");
      setLink("");
      setImage("");
    }
  };

  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTodo(todo.todo);
    setDescription(todo.description || "");
    setLink(todo.link || "");
    setImage(todo.image || "");
    setTempUidd(todo.uidd);
  };

  const handleEditConfirm = () => {
    if (validateInput()) {
      update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
        todo: todo,
        description: description,
        link: link,
        image: image,
        tempUidd: tempUidd,
      });

      setTodo("");
      setDescription("");
      setLink("");
      setImage("");
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

  useEffect(() => {
    document.title = `Todo List - ${username || userEmail}`;
  }, [username, userEmail]);

  return (
    <div className="homepage bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">
        Welcome to Todo List, {username || userEmail}
      </h1>
      <div className="w-full max-w-md mb-4 relative">
        <input
          className={`add-edit-input p-2 pr-8 border rounded border-gray-300 w-full ${inputError ? 'border-red-500' : ''}`}
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

      <div className="w-full max-w-md p-2 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 rounded-md mt-4 max-h-80">
        {todos.map((todo) => (
          <div
            key={todo.uidd}
            className={`todo flex items-center justify-between bg-white p-2 mb-2 rounded border border-gray-300 ${todo.completed ? 'completed' : ''}`}
          >
            <div className="flex items-center">
              <div className="cursor-pointer mr-2" onClick={() => handleCompleteToggle(todo.uidd, todo.completed)}>
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
                <LinkIcon
                  fontSize="large"
                  onClick={() => window.open(todo.link, "_blank")}
                  className="cursor-pointer text-blue-500"
                />
              )}
              {todo.image && (
                <ImageIcon
                  fontSize="large"
                  onClick={() => alert(`Image: ${todo.image}`)}
                  className="cursor-pointer text-blue-500"
                />
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
    </div>
  );
}
