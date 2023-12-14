import Container from "react-bootstrap/Container";
// import Nav from "react-bootstrap/Nav";
import BootstrapNavbar from "react-bootstrap/Navbar"; // Rename the import
import React from "react";
// import { Button } from "react-bootstrap";

function Navbar() {
  // const storedUser = localStorage.getItem("user");

  // const signOut = () => {
  //   localStorage.removeItem("user");
  //   // You can also perform additional actions if needed
  //   console.log("User information removed from local storage");
  //   window.location.reload();
  // };

  return (
    <div>
      <BootstrapNavbar bg="dark" data-bs-theme="dark">
        <Container>
          <BootstrapNavbar.Brand href="#" disabled>
            Gmail Utility{" "}
          </BootstrapNavbar.Brand>
          {/* {storedUser && (
            <Nav className="me-auto">
              <Button onClick={signOut}>Sign Out</Button>
            </Nav>
          )} */}
        </Container>
      </BootstrapNavbar>
    </div>
  );
}

export default Navbar;
