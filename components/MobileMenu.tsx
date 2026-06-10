"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileMenu({ session }: { session: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)}>
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 w-full bg-white border-t shadow-lg z-50">
          <div className="flex flex-col p-4 gap-4">

            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>

            {/* ✅ Katalog selalu muncul untuk semua user */}
            <Link href="/katalog" onClick={() => setOpen(false)}>
              Katalog
            </Link>

            {session?.user?.role === "user" && (
              <>
                <Link href="/status" onClick={() => setOpen(false)}>
                  Status
                </Link>
                <Link href="/formulir" onClick={() => setOpen(false)}>
                  Pendaftaran
                </Link>
              </>
            )}

            {session?.user?.role === "admin" && (
              <>
                <Link href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
                <Link href="/user" onClick={() => setOpen(false)}>
                  Users
                </Link>
              </>
            )}

            {session ? (
              <>
                <div className="border-t pt-4">
                  <p className="font-semibold">{session.user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{session.user?.role}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-600"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      )}
    </>
  );
}