import React, { useState, useEffect } from 'react';

const UserList = () => {
  // Declare state variables
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    // API endpoint
    const url = 'https://randomuser.me/api/?results=3';

    // Fetching data
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data.results); // Store the results in the state
        setLoading(false); // Set loading to false
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render loading state, error, or user list
  return (
    <div>
      <h1>Api demo of Random Users</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <p>{user.name.first} {user.name.last}</p>
            <p>Email: {user.email}</p>
            <img src={user.picture.thumbnail} alt={`${user.name.first} ${user.name.last}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
