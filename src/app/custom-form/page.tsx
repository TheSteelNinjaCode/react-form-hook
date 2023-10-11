"use client";

import { User } from "@prisma/client";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";

export default function CustomForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [user, setUser] = useState<User>({
    id: 0,
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    age: 0,
    password: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const modal = useRef<HTMLDialogElement | null>(null);

  const GetUsers = async () => {
    const res = await axios.get("/api/users").catch((error) => {
      console.log("catch: ", error.message);
    });

    if (res && res.data) {
      setUsers(res.data.users);
    }
  };

  useEffect(() => {
    GetUsers();
  }, []);

  const AddUser = async (e: MouseEvent<HTMLButtonElement>) => {
    setErrors([]);
    const validationErrors: string[] = [];

    if (user.login.length < 1) {
      validationErrors.push("Login can't be empty");
    }
    if (user.email.length < 1) {
      validationErrors.push("Email can't be empty");
    }
    if (user.password.length < 3) {
      validationErrors.push("Password must be 3 characters or more");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    e.preventDefault();

    const resp = await axios.post("/api/users", {
      login: user.login,
      email: user.email,
      password: user.password,
    });

    if (resp && resp.data) {
      GetUsers();
    }

    ResetUser();
  };

  const UpdateUser = async (e: MouseEvent<HTMLButtonElement>) => {
    setErrors([]);
    if (user.login.length < 1) {
      setErrors((prevState) => [...prevState, "Login cant'n be empty"]);
      return;
    } else if (user.email.length < 1) {
      setErrors((prevState) => [...prevState, "Email cant'n be empty"]);
      return;
    } else if (user.password.length < 3) {
      setErrors((prevState) => [
        ...prevState,
        "Password must be 3 characters or more",
      ]);
      return;
    }

    e.preventDefault();

    const resp = await axios.put("/api/users/", {
      id: user.id,
      login: user.login,
      email: user.email,
      password: user.password,
    });

    if (resp && resp.data) {
      console.log("UpdateUser->resp.data: ", resp.data);
      GetUsers();
    }

    ResetUser();
  };

  const ResetUser = () => {
    setUser((prevState) => ({
      ...prevState,
      id: 0,
      login: "",
      email: "",
      password: "",
    }));
  };

  const EditUser = (userId: number) => {
    setErrors([]);
    const userFound = users.find((user) => user.id === userId);
    if (userFound) {
      setUser(userFound);
    }
  };

  const DeleteUser = async (userId: number, deleteConfirm: boolean) => {
    if (modal.current) {
      modal.current.showModal();
    }

    if (!deleteConfirm) {
      setUser((user) => ({ ...user, id: userId }));
      return;
    }
    
    const resp = await axios
      .delete("/api/users", {
        params: { id: user.id },
      })
      .catch((error) => {
        console.log("catch: ", error.message);
      });

    if (resp && resp.data) {
      GetUsers();
    }
    ResetUser();
  };

  const CancelEdit = () => {
    ResetUser();
  };

  // Update specific input field
  const HandleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setUser((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mb-4 font-bold text-4xl">Custom Users</h1>
      <div className="card border border-gray-200 bg-base-100 p-4 shadow-xl">
        <div className="flex gap-4 divide-x-2 divide-dotted">
          <div className="space-y-4">
            <ul>
              {errors.map((error, idx) => (
                <li className="text-red-500" key={idx}>
                  {error}
                </li>
              ))}
            </ul>

            <form className="flex flex-col gap-2">
              <input
                onChange={HandleChange}
                value={user.login}
                type="text"
                name="login"
                required
                placeholder="Login"
                className="input input-bordered"
              />
              <input
                onChange={HandleChange}
                value={user.email}
                type="email"
                name="email"
                required
                placeholder="Email"
                className="input input-bordered"
              />
              <input
                onChange={HandleChange}
                value={user.password}
                type="password"
                name="password"
                required
                placeholder="Password"
                minLength={3}
                className="input input-bordered"
              />
              <div className="space-x-4">
                <button
                  type="submit"
                  disabled={user.id > 0 ? true : false}
                  onClick={AddUser}
                  className="btn btn-primary disabled:bg-gray-500 disabled:text-gray-300"
                >
                  Add
                </button>
                <button
                  type="submit"
                  disabled={user.id < 1 ? true : false}
                  onClick={UpdateUser}
                  className="btn btn-accent disabled:bg-gray-500 disabled:text-gray-300"
                >
                  Update
                </button>
                <button
                  type="submit"
                  disabled={user.id < 1 ? true : false}
                  onClick={CancelEdit}
                  className="btn btn-primary disabled:bg-gray-500 disabled:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="ps-4 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Login</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.login}</td>
                    <td>{user.email}</td>
                    <td className="space-x-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => EditUser(user.id)}
                      >
                        <FaPenToSquare />
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => DeleteUser(user.id, false)}
                      >
                        <FaTrashCan />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <dialog ref={modal} id="deleteModal" className="modal">
        <form method="dialog" className="modal-box">
          <button
            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
            onClick={() => CancelEdit()}
          >
            ✕
          </button>
          <h3 className="text-lg font-bold">Delete</h3>
          <p className="py-4">Are you sure you want to delete this user?</p>
          <div className="modal-action">
            <button
              onClick={() => DeleteUser(user.id, true)}
              className="btn btn-primary"
            >
              Yes
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
