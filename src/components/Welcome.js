// Welcome.js
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerInformation, setRegisterInformation] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user && registrationSuccess) {
        alert("Successfully Created New Account");
        setRegistrationSuccess(false);
        navigate("/homepage");
      }
    });
  }, [registrationSuccess, navigate]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/homepage");
      })
      .catch((err) => alert(err.message));
  };

  const handleEnter = (e) => {
    setPassword(e.target.value);
  
    // Check if the pressed key is "Enter"
    if (e.key === "Enter") {
      handleSignIn();
    }
  };
  
  const handleRegister = () => {
    if (registerInformation.password !== registerInformation.confirmPassword) {
      alert("Please confirm that passwords are the same");
      return;
    }
    createUserWithEmailAndPassword(
      auth,
      registerInformation.email,
      registerInformation.password
    )
      .then((userCredential) => {
        // Add the username to the user's profile
        updateProfile(userCredential.user, { displayName: registerInformation.username })
          .then(() => {
            setRegistrationSuccess(true);
          })
          .catch((err) => alert(err.message));
      })
      .catch((err) => alert(err.message));
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-md mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">
          Todo-List
        </h1>
        <div className="login-register-container space-y-4">
          {isRegistering ? (
            <>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="input border border-gray-300 p-2 rounded"
                  value={registerInformation.username}
                  onChange={(e) =>
                    setRegisterInformation({
                      username: e.target.value,
                    })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input border border-gray-300 p-2 rounded"
                  value={registerInformation.email}
                  onChange={(e) =>
                    setRegisterInformation({
                      ...registerInformation,
                      email: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="input border border-gray-300 p-2 rounded"
                  value={registerInformation.password}
                  onChange={(e) =>
                    setRegisterInformation({
                      ...registerInformation,
                      password: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input border border-gray-300 p-2 rounded"
                  value={registerInformation.confirmPassword}
                  onKeyPress={handleEnter}
                  onChange={(e) =>
                    setRegisterInformation({
                      ...registerInformation,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex">
                <button className="btn-primary mr-2 p-2 rounded-md" onClick={handleRegister}>
                  Register
                </button>
                <button
                  className="btn-secondary mr-2 p-2 rounded-md"
                  onClick={() => setIsRegistering(false)}
                >
                  Go Back To Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="input border border-gray-300 p-2 rounded"
                  onChange={handleEmailChange}
                  value={email}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="input border border-gray-300 p-2 rounded"
                  onChange={handlePasswordChange}
                  onKeyPress={handleEnter}
                  value={password}
                />
              </div>
              <div className="flex">
                <button className="btn-primary mr-2 p-2 rounded-md" onClick={handleSignIn}>
                  Login
                </button>
                <button
                  className="btn-secondary mr-2 p-2 rounded-md"
                  onClick={() => setIsRegistering(true)}
                >
                  Create an account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-grow"></div>
      <div className="mb-4 text-center text-gray-500">
        &copy; 2024 Prem Acharya
      </div>
    </div>
  );
}
