import { User } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

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
  }
}

export async function POST(req: Request) {
  try {
    const user = (await req.json()) as User;
    user.age = user.age ? parseInt(user.age.toString(), 10) : 0;

    const userRegistered = await prisma.user.create({
      data: user,
    });
    return new Response(
      JSON.stringify({ userRegistered, message: "Se ha registrado con éxito" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:34 ~ POST ~ error:", error);
  }
}

export async function PUT(req: Request) {
  try {
    const user = (await req.json()) as User;
    console.log("🚀 ~ file: route.ts:41 ~ PUT ~ user:", user);

    const userUpdated = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return new Response(
      JSON.stringify({ userUpdated, message: "Se ha actualizado con éxito" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ file: route.ts:53 ~ PUT ~ error:", error);
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
  }
}
