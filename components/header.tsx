import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { NavButtonWithLoading } from "./nav-button-with-loading";

const Header = async () => {
  await checkUser();
  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-white/80 backdrop-blur-md z-50 border-b shadow-sm">
      <nav className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Paisa Kharcha Logo"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href={"/dashboard"}
              className="text-gray-600 hover:text-blue-600"
            >
              <Button variant="outline" className="h-10 px-4">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <NavButtonWithLoading
              href="/transaction/create"
              className="flex items-center gap-2 h-10 px-4"
            >
              <PenBox size={18} />
              <span className="hidden md:inline">Add Transaction</span>
            </NavButtonWithLoading>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
