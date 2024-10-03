// app/signup/page.tsx
"use client";

import React from "react"; // Added React import
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    console.log("signup", name, password);
    
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      router.push("/signin");
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ }}>
        <div>
          <label>
            Name:
            <input name="name" type="text" required />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input name="email" type="email" required />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input name="password" type="password" required />
          </label>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}