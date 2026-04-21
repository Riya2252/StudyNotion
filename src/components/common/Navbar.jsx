import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-center transition-all duration-300 ${
        scrolled || location.pathname !== "/"
          ? "border-b border-white/10 bg-richblack-900/80 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/" className="transition-opacity duration-200 hover:opacity-80">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-8 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-50"
                        : "text-richblack-100 hover:text-white"
                    }`}
                  >
                    <p>{link.title}</p>
                    <BsChevronDown className="transition-transform duration-200 group-hover:rotate-180" />
                    <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[220px] translate-x-[-50%] translate-y-[3em] flex-col rounded-2xl border border-white/10 bg-richblack-900/95 p-3 opacity-0 shadow-xl shadow-black/40 backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[280px]">
                      <div className="absolute left-[50%] top-0 -z-10 h-4 w-4 translate-x-[80%] translate-y-[-40%] rotate-45 rounded-sm border-l border-t border-white/10 bg-richblack-900/95"></div>
                      {loading ? (
                        <p className="py-2 text-center text-sm text-richblack-300">Loading...</p>
                      ) : subLinks && subLinks.length ? (
                        subLinks
                          .filter((subLink) => subLink?.courses?.length > 0)
                          .map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                              className="rounded-xl px-4 py-3 text-sm text-richblack-200 transition-all duration-150 hover:bg-white/5 hover:text-white"
                              key={i}
                            >
                              {subLink.name}
                            </Link>
                          ))
                      ) : (
                        <p className="py-2 text-center text-sm text-richblack-300">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`text-sm font-medium transition-colors duration-200 ${
                        matchRoute(link?.path)
                          ? "text-yellow-50"
                          : "text-richblack-100 hover:text-white"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-3 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative p-2">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100 transition-colors hover:text-white" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-yellow-50 text-center text-xs font-bold text-richblack-900">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-richblack-100 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-25 px-5 py-2 text-sm font-bold text-richblack-900 transition-all duration-200 hover:scale-[1.03] hover:shadow-glow-yellow">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>

        <button className="mr-4 md:hidden">
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>
    </div>
  )
}

export default Navbar
