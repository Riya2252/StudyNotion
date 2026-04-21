import { Link } from "react-router-dom";

const Button = ({ children, active, linkto }) => {
  return (
    <Link to={linkto}>
      <div
        className={`text-center text-[13px] sm:text-[16px] px-7 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.03] ${
          active
            ? "bg-gradient-to-r from-yellow-50 to-yellow-25 text-richblack-900 shadow-[0_0_20px_rgba(255,214,10,0.25)] hover:shadow-[0_0_30px_rgba(255,214,10,0.4)]"
            : "border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:border-white/20 hover:bg-white/10"
        }`}
      >
        {children}
      </div>
    </Link>
  );
};

export default Button;
