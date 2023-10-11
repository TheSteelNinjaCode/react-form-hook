"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserSchema } from "@/lib/types";

export default function ReactHookFormWithZod() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isDirty },
    reset,
  } = useForm<User>({
    defaultValues: {
      id: 0,
      firstName: "",
      lastName: "",
      login: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(UserSchema),
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    id: 0,
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    age: 0,
    password: "",
    confirmPassword: "",
  });
  const modal = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const resp = await axios.get("/api/users-zod");

        toast.promise(Promise.resolve(resp.data), {
          loading: "Loading...",
          success: (data) => {
            setUsers(data.users);
            return `${data.message}`;
          },
          error: "Error loading users",
        });
      } catch (error) {
        toast.error(`Error: ${error}`);
      }
    };
    getUsers();
  }, []);

  const onSubmit = async (data: User) => {
    if (isEdit) update(data);
    else create(data);
  };

  const create = async (data: User) => {
    try {
      const toastId = toast.loading("Loading...");
      const resp = await axios.post("/api/users-zod", data);

      // toast.promise(Promise.resolve(resp.data), {
      //   loading: "Loading...",
      //   success: (data) => {
      //     return `${data.message}`;
      //   },
      //   error: "Error",
      // });

      if (resp && resp.data) {
        if (resp.data.errors) {
          resp.data.errors.forEach(
            (error: { path: keyof User; message: string }) => {
              clearErrors(error.path);
              setError(error.path, {
                type: "validate",
                message: error.message,
              });
              toast.error(`Error: ${error.message}`, {
                id: toastId,
              });
            }
          );
          return;
        }

        setUsers((prevState) => [...prevState, resp.data.userRegistered]);
      }
      toast.success(
        `User ${resp.data.userRegistered.firstName} ${resp.data.userRegistered.lastName} created!`,
        {
          id: toastId,
        }
      );
      
      resetUser();
    } catch (error) {
      console.log("🚀 ~ file: page.tsx:118 ~ create ~ error:", error);
      toast.error(`Error: ${error}`);
    }
  };

  const update = async (data: User) => {
    try {
      const toastId = toast.loading("Loading...");
      const resp = await axios.put("/api/users-zod/", data);

      // toast.promise(Promise.resolve(resp.data), {
      //   loading: "Loading...",
      //   success: (data) => {
      //     return data.message;
      //   },
      //   error: "Error",
      // });

      if (resp && resp.data) {
        if (resp.data.errors) {
          resp.data.errors.forEach(
            (error: { path: keyof User; message: string }) => {
              clearErrors(error.path);
              setError(
                error.path,
                {
                  type: "validate",
                  message: error.message,
                },
                { shouldFocus: true }
              );
              toast.error(`Error: ${error.message}`, {
                id: toastId,
              });
            }
          );
          return;
        }

        setUsers((prevState) => {
          const index = prevState.findIndex(
            (user) => user.id === resp.data.userUpdated.id
          );
          prevState[index] = resp.data.userUpdated;
          return prevState;
        });
      }
      toast.success(
        `User ${resp.data.userUpdated.firstName} ${resp.data.userUpdated.lastName} updated!`,
        {
          id: toastId,
        }
      );
      resetUser();
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const editUser = (editUser: User) => {
    if (editUser) {
      reset(
        { ...editUser, confirmPassword: editUser.password },
        { keepDefaultValues: true }
      );
      setIsEdit(true);
      setUser(editUser);
    }
  };

  const deleteUser = async (deleteUser: User, deleteConfirm: boolean) => {
    if (modal.current) {
      modal.current.showModal();
    }

    if (!deleteConfirm) {
      setUser(deleteUser);
      return;
    }

    try {
      const resp = await axios.delete("/api/users-zod", {
        params: { id: deleteUser.id },
      });

      toast.promise(Promise.resolve(resp.data), {
        loading: "Loading...",
        success: (data) => {
          setUsers((prevState) =>
            prevState.filter((user) => user.id !== resp.data.userDeleted.id)
          );
          resetUser();
          return `${data.message}`;
        },
        error: (error) => {
          return `Error: ${error}`;
        },
      });
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const resetUser = () => {
    setIsEdit(false);
    setUser({
      id: 0,
      firstName: "",
      lastName: "",
      login: "",
      email: "",
      age: 0,
      password: "",
      confirmPassword: "",
    });

    reset();
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mb-4 font-bold text-4xl">
        React Hook Form With Zod Users
      </h1>
      <div className="card border border-gray-200 bg-base-100 p-4 shadow-xl">
        <div className="flex gap-4 divide-x-2 divide-dotted">
          <div className="space-y-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <p className="font-bold text-sm">
                {isDirty &&
                  `Full name: ${watch("firstName")} ${watch("lastName")}`}
              </p>
              <input
                {...register("firstName")}
                type="text"
                placeholder="First name"
                className="input input-bordered"
                autoFocus
              />
              {errors.firstName && (
                <span className="text-red-500">{`${errors.firstName.message}`}</span>
              )}
              <input
                {...register("lastName")}
                type="text"
                placeholder="Last name"
                className="input input-bordered"
              />
              {errors.lastName && (
                <span className="text-red-500">{`${errors.lastName.message}`}</span>
              )}
              <input
                {...register("login")}
                type="text"
                placeholder="Login"
                className="input input-bordered"
              />
              {errors.login && (
                <span className="text-red-500">{`${errors.login.message}`}</span>
              )}
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="input input-bordered"
              />
              {errors.email && (
                <span className="text-red-500">{`${errors.email.message}`}</span>
              )}
              <input
                {...register("age", { valueAsNumber: true })}
                type="number"
                placeholder="Age"
                className="input input-bordered"
              />
              {errors.age && (
                <span className="text-red-500">{`${errors.age.message}`}</span>
              )}
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="input input-bordered"
              />
              {errors.password && (
                <span className="text-red-500">{`${errors.password.message}`}</span>
              )}
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm Password"
                className="input input-bordered"
              />
              {errors.confirmPassword && (
                <span className="text-red-500">{`${errors.confirmPassword.message}`}</span>
              )}
              <div className="space-x-4">
                <button
                  type="submit"
                  disabled={isEdit}
                  className="btn btn-primary disabled:bg-gray-500 disabled:text-gray-300"
                >
                  Add
                </button>
                <button
                  type="submit"
                  disabled={!isEdit}
                  className="btn btn-accent disabled:bg-gray-500 disabled:text-gray-300"
                >
                  Update
                </button>
                <button
                  type="button"
                  disabled={!isEdit}
                  onClick={resetUser}
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
                        onClick={() => editUser(user)}
                      >
                        <FaPenToSquare />
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteUser(user, false)}
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
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
            ✕
          </button>
          <h3 className="text-lg font-bold">Delete</h3>
          <p className="py-4">
            Are you sure you want to delete the user{" "}
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            ?
          </p>
          <div className="modal-action">
            <button
              onClick={() => deleteUser(user, true)}
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
