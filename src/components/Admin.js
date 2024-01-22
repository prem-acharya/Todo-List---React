import React, { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function Admin() {
  const [userData, setUserData] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);

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
      console.log("Current User:", user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleUserTodos = (userId) => {
    setExpandedUser((prevUser) => (prevUser === userId ? null : userId));
  };

  return (
    <div className="admin-page bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl p-8 bg-white rounded shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">
          Welcome Admin!
        </h1>
        {Object.keys(userData).map((userId) => (
          <div key={userId} className="user-container mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold mb-2">
                {usernames[userId] || "Unknown User"}'s Todos
              </h2>
              <button
                onClick={() => toggleUserTodos(userId)}
                className="text-blue-500 cursor-pointer"
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
                {Object.keys(userData[userId]).map((todoId) => {
                  const todo = userData[userId][todoId];
                  return (
                    <li
                      key={todoId}
                      className="todo bg-white p-6 my-4 rounded-md shadow-lg"
                    >
                      <span className="text-xl font-bold block mb-2">
                        {todo.todo}
                      </span>
                      {todo.images && (
                        <div className="flex flex-wrap">
                          {todo.images.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className="w-10 h-10 object-cover rounded m-1 cursor-pointer"
                            />
                          ))}
                        </div>
                      )}
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
