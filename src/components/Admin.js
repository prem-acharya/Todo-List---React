import React, { useEffect, useState } from "react";
import { onValue, ref, remove, set } from "firebase/database";
import { db, auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [userData, setUserData] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await onValue(ref(db), (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("userData", userData);
          setUserData(userData);
        }
      });
      return data;
    };

    fetchData();

    const fetchUsernames = async () => {
      const usernamesData = await onValue(ref(db, "usernames"), (snapshot) => {
        if (snapshot.exists()) {
          setUsernames(snapshot.val());
        }
      });
      return usernamesData;
    };

    fetchUsernames();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User:", user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleUserTodos = (userId) => {
    setExpandedUser((prevUser) => (prevUser === userId ? null : userId));
  };

  const handleDeleteTodo = async (userId, todoId) => {
    try {
      // Remove the todo from the database
      await remove(ref(db, `${userId}/${todoId}`));
    } catch (error) {
      console.error("Delete Todo Error:", error.message);
    }
  };

  const handleToggleComplete = async (userId, todoId, isCompleted) => {
    try {
      // Update the 'completed' status in the database
      await set(ref(db, `${userId}/${todoId}/completed`), !isCompleted);
    } catch (error) {
      console.error("Toggle Complete Error:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      alert("Logout successful!");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  document.title = "Todo List - Admin";

  return (
    <div className="admin-page bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-8 bg-white rounded shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">
          Welcome Admin!
        </h1>
        <div className="flex justify-end mb-6">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded cursor-pointer hover:bg-red-600"
          >
            <LogoutIcon className="mr-2"/>
            Logout
          </button>
        </div>
        {Object.keys(userData).map((userId, userIndex) => (
          <div key={userId} className="todo bg-white cursor-pointer p-6 my-4 rounded-md shadow-xl transition-transform transform hover:scale-95">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold mb-2" onClick={() => toggleUserTodos(userId)}>
                {`${userIndex + 1}. ${usernames[userId] || "Unknown User"}'s Todos`}
              </h2>
              <button
                onClick={() => toggleUserTodos(userId)}
                className="bg-blue-500 rounded-lg text-white cursor-pointer"
              >
                {expandedUser === userId ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </button>
            </div>
            {expandedUser === userId && (
              <ul className="space-y-4">
                {Object.keys(userData[userId]).map((todoId, index) => {
                  const todo = userData[userId][todoId];
                  return (
                    <li
                      key={todoId}
                      className="todo bg-white p-6 my-4 rounded-md shadow-lg transition-transform transform hover:scale-105 flex justify-between items-center"
                    >
                      <div className="items-center">
                        <span className={`text-xl font-md mb-2 ${todo.completed ? 'line-through' : ''}`}>
                          { `${index + 1}. ${todo.todo}`}
                        </span>
                        {todo.images && (
                          <div className="flex flex-wrap">
                            {todo.images.map((imageUrl, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={imageUrl}
                                alt={`Image ${imgIndex + 1}`}
                                className="w-10 h-10 object-cover rounded m-1 cursor-pointer"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleComplete(userId, todoId, todo.completed)}
                          className="bg-green-500 text-white p-2 rounded cursor-pointer"
                        >
                          {todo.completed ? <ClearIcon /> : <CheckIcon />}
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(userId, todoId)}
                          className="bg-red-500 text-white p-2 rounded cursor-pointer"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
