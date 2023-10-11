"use client";

import { User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";

type UserValues = {
  confirmPassword: string;
} & User;

export default function ReactHookForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isDirty },
    reset,
    getValues,
    // setValue,
    // unregister,
  } = useForm<UserValues>({
    defaultValues: {
      id: 0,
      firstName: "",
      lastName: "",
      login: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    // shouldUnregister: true,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const modal = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const resp = await axios.get("/api/users");

        toast.promise(Promise.resolve(resp.data), {
          loading: "Loading...",
          success: (data) => {
            setUsers(resp.data.users);
            return `${data.message}`;
          },
          error: (error) => {
            return `${error.message}`;
          },
        });
      } catch (error) {
        toast.error(`Error: ${error}`);
      }
    };
    getUsers();
  }, []);

  const onSubmit = async (data: FieldValues) => {
    if (isEdit) update(data);
    else create(data);
  };

  const create = async (data: FieldValues) => {
    try {
      if (!validateEmail(data.email) || !validateLogin(data.login)) return;

      const { id, confirmPassword, ...postData } = data;
      // unregister(["id", "confirmPassword"], { keepDirtyValues: true });
      const resp = await axios.post("/api/users", postData);

      toast.promise(Promise.resolve(resp.data), {
        loading: "Loading...",
        success: (data) => {
          setUsers((prevState) => [...prevState, data.userRegistered]);
          return `${data.message}`;
        },
        error: "Error",
      });

      resetUser();
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const update = async (data: FieldValues) => {
    try {
      if (!validateEmail(data.email) || !validateLogin(data.login)) return;

      const { confirmPassword, ...postData } = data;
      const resp = await axios.put("/api/users/", postData);

      toast.promise(Promise.resolve(resp.data), {
        loading: "Loading...",
        success: (data) => {
          return `${data.message}`;
        },
        error: "Error",
      });

      if (resp && resp.data) {
        setUsers((prevState) => {
          const index = prevState.findIndex(
            (user) => user.id === resp.data.userUpdated.id
          );
          prevState[index] = resp.data.userUpdated;
          return prevState;
        });
      }
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
      //   setValue("id", editUser.id);
      //   setValue("firstName", editUser.firstName);
      //   setValue("lastName", editUser.lastName);
      //   setValue("login", editUser.login);
      //   setValue("email", editUser.email);
      //   setValue("age", editUser.age);
      //   setValue("password", editUser.password);
      //   setValue("confirmPassword", editUser.password);

      // Object.keys(editUser).forEach((fieldName) => {
      //   const userFields = fieldName as keyof User; // Use type assertion
      //   setValue(userFields, editUser[userFields]);
      // });

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
      const resp = await axios.delete("/api/users", {
        params: { id: deleteUser.id },
      });

      toast.promise(Promise.resolve(resp.data), {
        loading: "Loading...",
        success: (data) => {
          return `${data.message}`;
        },
        error: "Error",
      });

      if (resp && resp.data) {
        setUsers((prevState) =>
          prevState.filter((user) => user.id !== resp.data.userDeleted.id)
        );
      }
      resetUser();
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const validateEmail = (email: string) => {
    if (
      users.find((user) => user.email === email) &&
      isEdit &&
      watch("email") !== user.email
    ) {
      setError("email", {
        type: "validate",
        message: "Email is already registered",
      });
      return false;
    }
    return true;
  };

  const validateLogin = (login: string) => {
    if (
      users.find((user) => user.login === login) &&
      isEdit &&
      watch("login") !== user.login
    ) {
      setError("login", {
        type: "validate",
        message: "Login is already registered",
      });
      return false;
    }
    return true;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    reset();
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <h1 className="mb-4 font-bold text-4xl">React Hook Form Users</h1>
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
                {...register("firstName", {
                  required: "First name can't be empty",
                })}
                type="text"
                placeholder="First name"
                className="input input-bordered"
                autoFocus
              />
              {errors.firstName && (
                <span className="text-red-500">{`${errors.firstName.message}`}</span>
              )}
              <input
                {...register("lastName", {
                  required: "Last name can't be empty",
                })}
                type="text"
                placeholder="Last name"
                className="input input-bordered"
              />
              {errors.lastName && (
                <span className="text-red-500">{`${errors.lastName.message}`}</span>
              )}
              <input
                {...register("login", { required: "Login can't be empty" })}
                type="text"
                placeholder="Login"
                className="input input-bordered"
              />
              {(!isEdit || (isEdit && watch("login") !== user.login)) &&
                users.find((user) => user.login === watch("login")) && (
                  <p className="text-sm">
                    <span className="text-red-500">
                      This login is already registered
                    </span>
                  </p>
                )}
              {errors.login && (
                <span className="text-red-500">{`${errors.login.message}`}</span>
              )}
              <input
                {...register("email", { required: "Email can't be empty" })}
                type="email"
                placeholder="Email"
                className="input input-bordered"
              />
              {(!isEdit || (isEdit && watch("email") !== user.email)) &&
                users.find((user) => user.email === watch("email")) && (
                  <p className="text-sm">
                    <span className="text-red-500">
                      This email is already registered
                    </span>
                  </p>
                )}
              {errors.email && (
                <span className="text-red-500">{`${errors.email.message}`}</span>
              )}
              <input
                {...register("age", {
                  required: "Age can't be empty",
                  min: 1,
                  max: {
                    value: 120,
                    message: "Age must be between 1 and 120",
                  },
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="Age"
                className="input input-bordered"
              />
              {errors.age && (
                <span className="text-red-500">{`${errors.age.message}`}</span>
              )}

              <input
                {...register("password", {
                  required: "Password can't be empty",
                  minLength: {
                    value: 3,
                    message: "Password must be 3 characters or more",
                  },
                })}
                type="password"
                placeholder="Password"
                className="input input-bordered"
              />
              {errors.password && (
                <span className="text-red-500">{`${errors.password.message}`}</span>
              )}
              <input
                {...register("confirmPassword", {
                  required: "Confirm Password can't be empty",
                  minLength: {
                    value: 3,
                    message: "Confirm Password must be 3 characters or more",
                  },
                  validate: (value) =>
                    value === getValues("password") ||
                    "The passwords do not match",
                })}
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
