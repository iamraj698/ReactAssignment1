import React, { useEffect } from "react";

const GoogleLogoutButton = ({ onLogout }) => {
  useEffect(() => {
    // Load the Google API client library
    window.gapi.load("auth2", () => {
      // Initialize the GoogleAuth object
      window.gapi.auth2
        .init({
          client_id:
            "286350229674-h99brrctdc1uq1cko78l95caqo4h8v3r.apps.googleusercontent.com", // Replace with your Google Client ID
        })
        .then((auth2) => {
          // Attach the sign-out event handler
          const signOutButton = document.getElementById(
            "google-signout-button"
          );
          if (signOutButton) {
            signOutButton.addEventListener("click", () => {
              // Sign out the user
              auth2.signOut().then(() => {
                // Call the onLogout callback if provided
                if (onLogout) {
                  onLogout();
                }
              });
            });
          }
        });
    });
  }, [onLogout]);

  return <button id="google-signout-button">Sign Out with Google</button>;
};

export default GoogleLogoutButton;
