import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <Link className="btn btn-primary" href="/custom-form">
        Custom Form
      </Link>
      <Link className="btn btn-secondary" href="/react-hook-form">
        React Hook Form
      </Link>
      <Link className="btn btn-accent" href="/react-hook-form-with-zod">
        React Hook Form with Zod
      </Link>
      <Link className="btn btn-info" href="/react-hook-form-with-zod-and-ssr">
        React Hook Form with Zod And SSR
      </Link>
    </main>
  );
}
