import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "../lib/auth";
import AdminNotification from "./AdminNotification";
import MobileMenu from "./MobileMenu";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              priority
              className="rounded-full object-cover"
            />
          </div>
          <span className="font-semibold text-sm md:text-lg">
            PT. JAYA RIZKI ALEXANDRA
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-5 font-semibold text-gray-600">
            <li>
              <Link href="/">Home</Link>
            </li>

            {/* ✅ Katalog selalu tampil, untuk semua kondisi */}
            <li>
              <Link href="/katalog">Katalog</Link>
            </li>

            {/* Menu khusus role user */}
            {session?.user?.role === "user" && (
              <>
                <li>
                  <Link href="/status">Status</Link>
                </li>
                <li>
                  <Link href="/formulir">Pendaftaran</Link>
                </li>
              </>
            )}

            {/* Menu khusus role admin */}
            {session?.user?.role === "admin" && (
              <>
                <li>
                  <Link href="/admin">Admin</Link>
                </li>
                <li>
                  <Link href="/user">Users</Link>
                </li>
              </>
            )}
          </ul>

          <div className="flex items-center gap-3">
            {session?.user?.role === "admin" && <AdminNotification />}

            {session && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-sm">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.role}</p>
                </div>
                <Image
                  src={session.user?.image || "/next.svg"}
                  alt="Avatar"
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              </div>
            )}

            {session ? (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className="md:hidden">
          <MobileMenu session={session} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;