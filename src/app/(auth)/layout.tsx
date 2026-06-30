import { Heart } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-humanitarian-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary-600 rounded-2xl mb-4 shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Red Humanitaria</h1>
            <p className="text-gray-500 text-sm mt-1">
              Coordinando ayuda donde más se necesita
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
