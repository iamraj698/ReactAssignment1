import React from "react";
import GoogleLogoutButton from "./GoogleLogoutButton";

const MainComponent = () => {
  // Your logout callback function
  const handleLogout = () => {
    // Additional logic to redirect, update state, or perform any other action after logout
    console.log("User logged out");
  };

  return (
    <div>
      {/* Your main content */}
      <h1>Welcome to My App</h1>

      {/* Logout button */}
      <GoogleLogoutButton onLogout={handleLogout} />
    </div>
  );
};

export default MainComponent;
