import { prisma } from "../../../lib/prisma";
import { UserSchema } from "@/lib/types";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return new Response(
      JSON.stringify({ users, message: "All users loaded" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:11 ~ GET ~ error:", error);
    return new Response(JSON.stringify({ error }), {
      status: 500, // or any other appropriate status code
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = UserSchema.safeParse(body);
    let zodErrors = {};

    if (!result.success) {
      result.error.issues.map((issue) => {
        zodErrors = {
          ...zodErrors,
          [issue.path[0]]: issue.message,
        };
      });

      // Handle the validation errors here if needed
      return new Response(JSON.stringify({ errors: zodErrors }), {
        status: 400, // or any other appropriate status code
      });
    }

    // Custom email and login uniqueness check using Prisma
    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email: result.data.email,
        id: { not: result.data.id }, // Exclude the current user
      },
    });

    const existingUserWithLogin = await prisma.user.findFirst({
      where: {
        login: result.data.login,
        id: { not: result.data.id }, // Exclude the current user
      },
    });

    const uniqueUserFields = [];
    if (existingUserWithEmail) {
      uniqueUserFields.push({
        path: "email",
        message: "Email is already registered",
      });
    }

    if (existingUserWithLogin) {
      uniqueUserFields.push({
        path: "login",
        message: "Login is already registered",
      });
    }

    if (uniqueUserFields.length > 0) {
      return new Response(JSON.stringify({ errors: uniqueUserFields }), {
        status: 206,
      });
    }

    // Only create a user if validation is successful
    const { id, confirmPassword, ...userData } = result.data; // Extract the valid data
    const userRegistered = await prisma.user.create({
      data: userData,
    });

    return new Response(
      JSON.stringify({
        userRegistered,
        message: "Se ha registrado con éxito",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:34 ~ POST ~ error:", error);
    // Handle other errors here if needed
    return new Response(JSON.stringify({ error }), {
      status: 500, // or any other appropriate status code
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const result = UserSchema.safeParse(body);
    let zodErrors = {};
    if (!result.success) {
      result.error.issues.map((issue) => {
        zodErrors = {
          ...zodErrors,
          [issue.path[0]]: issue.message,
        };
      });

      // Handle the validation errors here if needed
      return new Response(JSON.stringify({ errors: zodErrors }), {
        status: 400, // or any other appropriate status code
      });
    }

    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email: result.data.email,
        id: { not: result.data.id }, // Exclude the current user
      },
    });

    const existingUserWithLogin = await prisma.user.findFirst({
      where: {
        login: result.data.login,
        id: { not: result.data.id }, // Exclude the current user
      },
    });

    const uniqueUserFields = [];
    if (existingUserWithEmail) {
      uniqueUserFields.push({
        path: "email",
        message: "Email is already registered",
      });
    }

    if (existingUserWithLogin) {
      uniqueUserFields.push({
        path: "login",
        message: "Login is already registered",
      });
    }

    if (uniqueUserFields.length > 0) {
      return new Response(JSON.stringify({ errors: uniqueUserFields }), {
        status: 206,
      });
    }

    const { confirmPassword, ...userData } = result.data;
    const userUpdated = await prisma.user.update({
      where: { id: userData.id },
      data: userData,
    });
    return new Response(
      Object.keys(zodErrors).length > 0
        ? JSON.stringify({ errors: zodErrors })
        : JSON.stringify({
            userUpdated,
            message: "Se ha actualizado con éxito",
          }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:194 ~ PUT ~ error:", error);
    // Handle other types of errors
    return new Response(JSON.stringify({ error }), {
      status: 500, // or any other appropriate status code
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    const postId =
      typeof id === "string"
        ? parseInt(id)
        : Array.isArray(id)
        ? parseInt(id[0])
        : id;
    const userDeleted = await prisma.user.delete({
      where: { id: postId },
    });
    return new Response(
      JSON.stringify({ userDeleted, message: "Se ha eliminado con éxito" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:78 ~ DELETE ~ error:", error);
    return new Response(JSON.stringify({ error }), {
      status: 500, // or any other appropriate status code
    });
  }
}
