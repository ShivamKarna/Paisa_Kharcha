import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
const Header = () => {
  return (
    <div className="fixed top-0">
      <SignedOut>
        <SignInButton />
        <SignUpButton></SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default Header;
