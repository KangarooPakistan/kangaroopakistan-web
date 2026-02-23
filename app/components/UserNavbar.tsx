"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

// interface SessionData {
//   role: string | undefined;
//   email: string | undefined | null;
// }

const UserNavbar = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [email, setEmail] = useState<string | null | undefined>("");
  const [name, setName] = useState<string | null | undefined>("");

  const router = useRouter();

  const toggleProfile = () => {
    setProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const goToProfile = () => {
    if (session && session.user && session.user.id) {
      router.push(`/user/profile/${session.user.id}`); // Use session.user.id directly
      toggleProfile();
    }
  };
  const changePassword = () => {
    if (session && session.user && session.user.id) {
      router.push(`/user/passwordchange/${session.user.id}`); // Use session.user.id directly
      toggleProfile();
    }
  };
  useEffect(() => {
    setEmail(session?.user.email);
    setName(session?.user.role);
  }, [session]);

  const logOut = () => {
    signOut({ callbackUrl: '/' });
    toggleProfile();
  };

  return (
    <nav className="bg-purple-600 text-white">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="" className="flex items-center space-x-3">
          <span className="self-center text-base md:text-2xl font-semibold whitespace-nowrap ">
            KangarooPakistan
          </span>
        </Link>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0  relative">
          <button
            type="button"
            onClick={toggleProfile}
            className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 "
            id="user-menu-button"
            aria-expanded={isProfileOpen}
            data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom">
            <span className="sr-only">Open user menu</span>
            <img
              className="w-8 h-8 rounded-full"
              src="https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg?w=740"
              alt="user photo"
            />
          </button>

          <div
            className={`z-50 ${
              isProfileOpen ? "block" : "hidden"
            } text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow absolute mt-[13.8rem] right-[4.5rem] md:mt-52 md:right-8`}
            id="user-dropdown">
            <div className="px-4 py-3">
              <span className="block text-sm text-gray-900 ">{name}</span>
              <span className="block text-sm text-gray-500 truncate ">
                {email}
              </span>
            </div>
            <ul className="py-2" aria-labelledby="user-menu-button">
              <li>
                <Button
                  onClick={goToProfile}
                  variant="outline"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full border-0 text-left">
                  Profile
                </Button>
              </li>
              <li>
                <Button
                  onClick={changePassword}
                  variant="outline"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full border-0 text-left">
                  Change Password
                </Button>
              </li>
              <li>
                <Button
                  variant="outline"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full border-0 text-left "
                  onClick={logOut}>
                  Sign out
                </Button>
              </li>
            </ul>
          </div>

          <button
            data-collapse-toggle="navbar-user"
            type="button"
            onClick={toggleMobileMenu}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
            aria-controls="navbar-user"
            aria-expanded={isMobileMenuOpen}>
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
          id="navbar-user">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ">
            <li>
              <Link
                href="/dashboard"
                className="block py-2 px-3 md:p-0"
                aria-current="page">
                Dashboard
              </Link>
            </li>
            {/* <li>
              <Link
                href="/user/active/contest"
                className="block py-2 px-3 md:p-0 "
              >
                Resources
              </Link>
            </li> */}
            <li>
              <Link
                href="/user/active/contest"
                className="block py-2 px-3 md:p-0 ">
                Contest
              </Link>
            </li>
            {/* <li>
              <Link href="/user" className="block py-2 px-3 md:p-0 ">
                History
              </Link>
            </li> */}
            {/* <li>
              <Link href="/user" className="block py-2 px-3 md:p-0 ">
                Notifications
              </Link>
            </li> */}
            {/* <li>
              <Link
                href="/user/enrollstudents"
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
              >
                Enroll Students
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
