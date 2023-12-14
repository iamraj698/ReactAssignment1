import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { Button, Table } from "react-bootstrap";
import "./Login.css";

const CLIENT_ID =
  "286350229674-h99brrctdc1uq1cko78l95caqo4h8v3r.apps.googleusercontent.com";
const SCOPE =
  "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send";

function Login() {
  const [user, setUser] = useState({});
  const [tokenClient, setTokenClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [acesstoken, setAcessToken] = useState("");
  // const [showChartsButtons, setShowChartsButtons] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  // const [showBarChart, setShowBarChart] = useState(false);
  // const [showPieChart, setShowPieChart] = useState(false);

  const handleCallbackResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);

    // Save user information to local storage
    localStorage.setItem("user", JSON.stringify(userObject));

    setUser(userObject);
  };

  const handleSignOut = () => {
    setUser({});
    setTokenClient(null);
    document.getElementById("signInDiv").hidden = false;
    setMessages([]);
    setShowCharts(false);
    // Clear user information from local storage
    localStorage.removeItem("user");
  };

  const createAccess = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  const getHeaderValue = (payload, headerName) => {
    if (!payload || !payload.headers || payload.headers.length === 0) {
      return "N/A";
    }

    const header = payload.headers.find((h) => h.name === headerName);
    return header ? header.value : "N/A";
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    // Check if user information is stored in local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    /*global google*/
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      size: "large",
    });
    if (!storedUser) {
      google.accounts.id.prompt();
    }
  }, []);

  useEffect(() => {
    const fetchMessagesCallback = async (tokenResponse) => {
      setAcessToken(tokenResponse.access_token);
      console.log(tokenResponse);
      if (tokenResponse && tokenResponse.access_token) {
        try {
          const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/${user.sub}/messages`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const messageIds = data.messages.map((message) => message.id);

            const messageDetailsPromises = messageIds.map(async (messageId) => {
              const messageResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/${user.sub}/messages/${messageId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                }
              );

              if (messageResponse.ok) {
                const messageData = await messageResponse.json();
                return messageData;
              } else {
                console.error(
                  "Error fetching message details:",
                  messageResponse.statusText
                );
                return null;
              }
            });

            const messagesWithDetails = await Promise.all(
              messageDetailsPromises
            );

            const filteredMessages = messagesWithDetails.filter(
              (message) => message !== null
            );

            setMessages(filteredMessages);
          } else {
            console.error("Error fetching messages:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    const refreshToken = async () => {
      // Use the refresh token to obtain a new access token
      try {
        const refreshResponse = await fetch(
          `https://oauth2.googleapis.com/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              refresh_token: user.refresh_token, // Include the refresh token
              grant_type: "refresh_token",
            }),
          }
        );

        if (refreshResponse.ok) {
          const refreshedTokenResponse = await refreshResponse.json();
          setAcessToken(refreshedTokenResponse.access_token);
          // Perform any additional actions with the new access token if needed
        } else {
          console.error("Error refreshing token:", refreshResponse.statusText);
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    if (user && user.sub) {
      setTokenClient(
        google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              await fetchMessagesCallback(tokenResponse);
            } else if (tokenResponse.error === "invalid_grant") {
              // If access token is expired, attempt to refresh it
              await refreshToken();
            }
          },
        })
      );
    }
  }, [user]);

  // send email
  const sendEmail = async () => {
    if (selectedEmail && tokenClient) {
      try {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${acesstoken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              raw: btoa(
                `To: ${getHeaderValue(selectedEmail.payload, "From")}\r\n` +
                  `Subject: Hi\r\n\r\n` +
                  `Hello There, We will get back to you on this.`
              ),
            }),
          }
        );

        if (response.ok) {
          console.log("Email sent successfully!");

          // Fetch the updated messages after sending the email
          const updatedResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/${user.sub}/messages`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${acesstoken}`,
              },
            }
          );

          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            const updatedMessageIds = updatedData.messages.map(
              (message) => message.id
            );

            const updatedMessageDetailsPromises = updatedMessageIds.map(
              async (messageId) => {
                const messageResponse = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/${user.sub}/messages/${messageId}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${acesstoken}`,
                    },
                  }
                );

                if (messageResponse.ok) {
                  const messageData = await messageResponse.json();
                  return messageData;
                } else {
                  console.error(
                    "Error fetching updated message details:",
                    messageResponse.statusText
                  );
                  return null;
                }
              }
            );

            const updatedMessagesWithDetails = await Promise.all(
              updatedMessageDetailsPromises
            );

            const updatedFilteredMessages = updatedMessagesWithDetails.filter(
              (message) => message !== null
            );

            setMessages(updatedFilteredMessages);
          } else {
            console.error(
              "Error fetching updated messages:",
              updatedResponse.statusText
            );
          }

          closePopup();
          alert("Email sent successfully!");
          // You can add additional logic here if needed
        } else {
          console.error("Error sending email:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } else {
      console.error("Selected email or tokenClient is null");
    }
  };

  const createBarChart = () => {
    const ctx = document.getElementById("barChart").getContext("2d");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyCounts = Array(12).fill(0);

    messages.slice(0, 1000).forEach((message) => {
      const date = new Date(parseInt(message.internalDate));
      const month = date.getMonth();
      monthlyCounts[month]++;
    });

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Monthly Email Distribution",
            data: monthlyCounts,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      },
    });

    // setShowBarChart(true);
    setShowCharts(true);
  };

  const createPieChart = () => {
    const ctx = document.getElementById("pieChart").getContext("2d");
    const labelCounts = {};

    messages.slice(0, 1000).forEach((message) => {
      message.labelIds.forEach((label) => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
      });
    });

    const labels = Object.keys(labelCounts);
    const data = Object.values(labelCounts);

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // setShowPieChart(true);
    setShowCharts(true);
  };

  const closeCharts = () => {
    setShowCharts(false);
    // setShowBarChart(false); 
    // setShowPieChart(false);

    // Destroy the bar chart
    const barChartCanvas = document.getElementById("barChart");
    if (barChartCanvas) {
      const barChartInstance = Chart.getChart(barChartCanvas);
      if (barChartInstance) {
        barChartInstance.destroy();
      }
    }

    // Destroy the pie chart
    const pieChartCanvas = document.getElementById("pieChart");
    if (pieChartCanvas) {
      const pieChartInstance = Chart.getChart(pieChartCanvas);
      if (pieChartInstance) {
        pieChartInstance.destroy();
      }
    }
  };

const analyse=()=>{
createBarChart();
createPieChart();
}
  return (
    <div className="container ">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <div id="signInDiv"></div>
        {Object.keys(user).length !== 0 && (
          <div>
            <button onClick={openPopup} className="btn btn-primary ">
              Send Email
            </button>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-end">
        {Object.keys(user).length !== 0 && (
          <Button className="mt-3 " variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        )}
      </div>

      {Object.keys(user).length !== 0 && (
        <div>
          <div className="d-flex flex-column align-items-center">
            {user.picture && <img src={user.picture} alt="User Profile" />}
            <h3>{user.name}</h3>
            <input
              type="submit"
              onClick={() => {
                createAccess();
              }}
              value="Fetch Messages"
              className="btn btn-primary"
            />
          </div>

          {/* Used to fetch the  messages*/}
          {messages.length > 0 && (
            <div className="table-container">
              <Table striped bordered hover size="sm" className="Tbl">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td>{getHeaderValue(message.payload, "From")}</td>
                      <td>{message.snippet}</td>
                      <td>{getHeaderValue(message.payload, "Subject")}</td>
                      <td>
                        {new Date(
                          parseInt(message.internalDate)
                        ).toLocaleString()}
                      </td>
                      <td>
                        {message.labelIds.length === 1
                          ? message.labelIds[0]
                          : message.labelIds[message.labelIds.length - 1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/*chart buttons */}

          {/* Close button for Charts */}
          {showCharts && (
            <div className="mt-3 mb-3">
              <button className="btn btn-danger" onClick={closeCharts}>
                Close Charts
              </button>
            </div>
          )}

          {/* Fetch buttons or Charts buttons based on visibility */}
          {messages.length > 0 && (
            <div className="mt-3 mb-5">

            <button
                className="btn btn-primary"
                onClick={analyse}
                hidden={showCharts}
              >
                Analyse The Messages
              </button>

              {/* <button
                className="btn btn-primary"
                onClick={createBarChart}
                hidden={showBarChart}
              >
                Fetch Bar Chart
              </button>
              <button
                className="btn btn-primary mx-3"
                onClick={createPieChart}
                hidden={showPieChart}
              >
                Fetch Pie Chart
              </button> */}
              <div className="d-flex justify-content-center ">
                <div style={{ width: "50%" }}>
                  <canvas id="barChart" width="400" height="400"></canvas>
                </div>
                <div style={{ width: "50%" }}>
                  <canvas id="pieChart" width="400" height="400"></canvas>
                </div>
              </div>
            </div>
          )}
          {/* 
      {messages.length > 0 && showChartsButtons && (
        <div>
          <button className="btn btn-primary mt-3" onClick={createBarChart}>
            Fetch Bar Chart
          </button>
          <button
            className="btn btn-primary mx-3 mt-3"
            onClick={createPieChart}
          >
            Fetch Pie Chart
          </button>
        </div>
      )} */}

          {showPopup && (
            <div>
              <div className="backdrop active">
                <div className="popup active">
                  <span className="close" onClick={closePopup}>
                    &times;
                  </span>
                  <h2>Select an Email</h2>
                  <select
                    className="form-control"
                    value={selectedEmail ? selectedEmail.id : ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedMessage = messages.find(
                        (message) => message.id === selectedId
                      );
                      setSelectedEmail(selectedMessage);
                    }}
                  >
                    <option value="">Select an Email</option>
                    {messages.map((message) => {
                      const fromHeader = getHeaderValue(
                        message.payload,
                        "From"
                      );
                      const emailMatch = fromHeader.match(/<([^>]+)>/);
                      const pureEmail = emailMatch ? emailMatch[1] : fromHeader;

                      return (
                        <option key={message.id} value={message.id}>
                          {pureEmail}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    className="btn btn-primary mt-3 mb-3"
                    onClick={sendEmail}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;
