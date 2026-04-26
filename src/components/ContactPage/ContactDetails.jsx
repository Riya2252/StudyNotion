import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { openChatWithAI } from "../../slices/chatSlice"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat on us",
    description: "Our friendly team is here to help.",
    details: "info@studynotion.com",
    action: "chat",
  },
  {
    icon: "BiWorld",
    heading: "Visit us",
    description: "Come and say hello at our office HQ.",
    details: "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
    action: "maps",
    mapsQuery: "Akshya+Nagar+1st+Block+1st+Cross+Rammurthy+nagar+Bangalore-560016",
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri From 8am to 5pm",
    details: "+123 456 7869",
    action: "tel",
    tel: "+1234567869",
  },
]

const ContactDetails = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const handleAction = (ele) => {
    if (ele.action === "chat") {
      if (!token) {
        navigate("/login")
        return
      }
      dispatch(openChatWithAI())
    } else if (ele.action === "maps") {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${ele.mapsQuery}`,
        "_blank",
        "noopener,noreferrer"
      )
    } else if (ele.action === "tel") {
      window.location.href = `tel:${ele.tel}`
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-4 lg:p-6">
      {contactDetails.map((ele, i) => {
        let Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon]
        return (
          <div
            key={i}
            onClick={() => handleAction(ele)}
            className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200 rounded-lg cursor-pointer hover:bg-richblack-700 transition-colors duration-200"
          >
            <div className="flex flex-row items-center gap-3">
              <Icon size={25} />
              <h1 className="text-lg font-semibold text-richblack-5">
                {ele?.heading}
              </h1>
            </div>
            <p className="font-medium">{ele?.description}</p>
            <p className="font-semibold text-yellow-50">{ele?.details}</p>
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails
