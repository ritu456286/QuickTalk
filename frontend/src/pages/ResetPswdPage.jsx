import { useState } from "react";
import { useParams} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
const ResetPswdPage = () => {

  const { userId, resetToken } = useParams();
  console.log(userId, resetToken);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
  });

  const handleSubmit = async(e) => {
    e.preventDefault();
    resetPassword({
      data: formData,
      userId, 
      resetToken
    })
  }

  const { resetPassword, isUpdatingPassword } = useAuthStore();
  return (
    <div className="h-screen grid lg:grid-cols-2">
    {/* Left Side - Form */}
    <div className="flex flex-col justify-center items-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
            transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">Update your Password</h1>
            <p className="text-base-content/60">Tell your new password!</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-base-content/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className={`input input-bordered w-full pl-10`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-base-content/40" />
                ) : (
                  <Eye className="h-5 w-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

            {/* CONFIRM PASSWORD GOES HERE */}
          
          <button type="submit" className="btn btn-primary w-full" disabled={isUpdatingPassword}>
            {isUpdatingPassword ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
        <div className="text-center">
          <p className="text-base-content/60">
            Sign In?{" "}
            <Link to="/login" className="link link-primary">
              Login Here
            </Link>
          </p>
        </div>
      
      </div>
    </div>

    {/* Right Side - Image/Pattern */}
    <AuthImagePattern
      title={"Welcome back!"}
      subtitle={"Sign in to continue your conversations and catch up with your messages."}
    />
  </div>
 
  )
}

export default ResetPswdPage
