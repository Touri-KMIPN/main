import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Logo and Header */}
      <div className="text-center mb-12">
        <img
          src="./TouriLogo.png"
          alt="Touri Logo"
          className="mx-auto mb-6 w-48 h-48"
        />
        <h1 className="text-6xl font-bold mb-2">Touri</h1>
        <p className="text-xl text-gray-700">
          Your AI Tour Guide In Your Pocket
        </p>
      </div>

      {/* Example Form */}
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@mail.com"
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <Button className="w-full py-3 cursor-pointer">
            Sign In
        </Button>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign In */}
        <Button
          variant={"outline"}
          className="w-full flex items-center cursor-pointer gap-2"
        >
          <img src="google-icon.svg" alt="GoogleIcon" className="w-5 h-5" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}