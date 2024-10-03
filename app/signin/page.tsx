// app/signin/page.tsx
"use client";

import { signIn, SignInResponse } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    const result: SignInResponse | undefined = await signIn("credentials", {
      redirect: false,
      name,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}