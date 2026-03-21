import React, { useState } from "react"
import { Box, Button } from "@mui/material"
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const [open, setOpen] = useState(true)
    const navigate = useNavigate()

  return (
    <Box>
      <LoginModal
        open={open}
        onClose={() => {
          setOpen(false);
          navigate("/events");
        }}
      />
    </Box>
  )
}

export default LoginPage
