import { User } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return new Response(JSON.stringify({ users, Message: "Response from API" }), {
    status: 200,
  });
}

export async function POST(req: Request) {
  const user = (await req.json()) as User;

  const userRegistered = await prisma.user.create({
    data: user,
  });
  return new Response(
    JSON.stringify({ userRegistered, Message: "Se ha registrado con éxito" }),
    {
      status: 200,
    }
  );
}

export async function PUT(req: Request) {
  const user = (await req.json()) as User;

  const userUpdated = await prisma.user.update({
    where: { id: user.id },
    data: user,
  });
  return new Response(
    JSON.stringify({ userUpdated, Message: "Se ha actualizado con éxito" }),
    {
      status: 200,
    }
  );
}

export async function DELETE(req: Request) {
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
    JSON.stringify({ userDeleted, Message: "Se ha eliminado con éxito" }),
    {
      status: 200,
    }
  );
}
