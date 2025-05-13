import React, { useEffect, useState, useContext } from "react";
import { CsvContext } from "../Context/Context";
import axios from "axios";

const Credits = () => {
  const [user, setUser] = useState({ id: "", name: "", credit:0 });
  const [trackList, setTrackList] = useState([]);
  const { userID, reload } = useContext(CsvContext);

  useEffect(() => {
    const fetchUser = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/user/getUser/${id}`);
        const data = response.data[0];
        setUser({ id: data.id, name: data.name });
      } catch (err) {
        console.log(err);
      }
    };

    const fetchTrack = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/user/getTrack/${id}`);
        setTrackList(response.data);
        setUser(prev => ({ ...prev, credit: response.data[0].credit || 0 }));
    } catch (error) {
        console.log(error);
      }
    };

    if (userID) {
      fetchUser(userID);
      fetchTrack(userID);
    }
  }, [userID, reload]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {/* Upper Banner */}
      <div style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ margin: 0 }}>👤 {user.name}</h2>
        <h3 style={{ margin: 0 }}>💰 Remaining Credit: {user.credit}</h3>
      </div>

      {/* Table Section */}
      <h2>User Track Details</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th style={thStyle}>User ID</th>
          <th style={thStyle}>Date</th>
            <th style={thStyle}>Credit</th>
            <th style={thStyle}>Operation</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Remaining Credit</th>

          </tr>
        </thead>
        <tbody>
          {trackList.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>{item.user_id}</td>
              <td style={tdStyle}>{item.date_time}</td>
              <td style={tdStyle}>{item.operation_credit}</td>
              <td style={tdStyle}>{item.operation}</td>
              <td style={tdStyle}>{item.message}</td>
              <td style={tdStyle}>{item.credit_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default Credits;
