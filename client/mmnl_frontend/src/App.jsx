import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    fetch("/api/me")
        .then((r) => (r.ok ? r.json() : null))
        .then(setUser);
  }, []);

  if (user === undefined) return <p>Loading...</p>;

  if (user === null) {
    return <a href="/oauth2/authorization/google">Sign in with Google</a>;
  }

  return <h1>Hello, {user.firstName}</h1>;
}