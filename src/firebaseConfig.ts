import fireb from "firebase/compat/app";

const firebaseConfig = {
  apiKey: "AIzaSyBHbD9SBZynUNojmjMT_drHmTCqVcYYVR0",
  authDomain: "informatica-en-los-negocios.firebaseapp.com",
  projectId: "informatica-en-los-negocios",
  storageBucket: "informatica-en-los-negocios.appspot.com",
  messagingSenderId: "955547425185",
  appId: "1:955547425185:web:0146fdec34ba58427793e0"
};

export const app = fireb.initializeApp(firebaseConfig);