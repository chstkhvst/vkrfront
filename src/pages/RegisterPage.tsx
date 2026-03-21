import React, { useState } from "react"
import { Box } from "@mui/material"
import RegisterModal from "../components/RegisterModal"
import { useNavigate } from "react-router-dom"

const RegisterPage: React.FC = () => {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()

  return (
    <Box>
      <RegisterModal
        open={open}
        onClose={() => {
          setOpen(false);
          navigate("/events");
        }}
      />
    </Box>
  )
}

export default RegisterPage
