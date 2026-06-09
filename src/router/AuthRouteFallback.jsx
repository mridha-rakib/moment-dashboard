import { Spinner } from "@/components/ui/spinner";

const AuthRouteFallback = () => (
  <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
    <Spinner className="size-8 text-black" />
  </div>
);

export default AuthRouteFallback;
