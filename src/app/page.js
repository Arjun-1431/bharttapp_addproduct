"use client";

import { useEffect } from "react";
import WelcomeScreen from "./components/WelcomeScreen";



export default function Landing(params) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
        window.location.href="/UserDetailSubmitPage"
    }, 500); 

    return () => clearTimeout(timer);
}, []);

  return(
    <WelcomeScreen/>
  )
}