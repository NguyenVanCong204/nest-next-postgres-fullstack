"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      alert(data.message);
      router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className={styles.input}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className={styles.input}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className={styles.input}
            required
          />

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
