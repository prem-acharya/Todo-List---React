import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGRr4QNUqneQ97rBkBZMr66QxJp3fACE0",
  authDomain: "todo-app-bf450.firebaseapp.com",
  databaseURL: "https://todo-app-bf450-default-rtdb.firebaseio.com",
  projectId: "todo-app-bf450",
  storageBucket: "todo-app-bf450.appspot.com",
  messagingSenderId: "612477282513",
  appId: "1:612477282513:web:ea9bbd0aade7cde3207df0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth();
