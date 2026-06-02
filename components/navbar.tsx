import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "../lib/auth";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              priority
              className="rounded-full object-cover"
            />
          </div>

          <span className="font-semibold text-lg">
            PT. JAYA RIZKI ALEXANDRA
          </span>
        </Link>

        {/* MENU */}
        <div className="flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-5 font-semibold text-gray-600">
            <li><Link href="/">Home</Link></li>

              {session?.user?.role === "user" && (
             <>
              <li><Link href="/status">Status</Link></li>
              <li><Link href="/formulir">Pendaftaran</Link></li>
        

            </>
          )}
            

                {/* 🔥 MENU ADMIN */}
                {session?.user?.role === "admin" && (
                  <>
                    <li><Link href="/admin">Admin</Link></li>
                    <li><Link href="/user">Users</Link></li>
                  </>
                )}
 
            
          </ul>

          {/* USER INFO */}
          {session && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end leading-tight">
                <span className="font-semibold text-gray-700 capitalize">
                  {session.user?.name}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {session.user?.role || "user"}
                </span>
              </div>

              <Image
                src={session.user?.image || "/next.svg"}
                alt="Avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          )}

          {/* AUTH BUTTON */}
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;